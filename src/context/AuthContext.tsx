
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

export type UserRole = 'doctor' | 'patient' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Supabase client safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a simple mock client if environment variables are not available
let supabase: any;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.error('Supabase credentials are missing. Check your environment variables.');
  // Create a mock client that logs operations but doesn't perform actual actions
  supabase = {
    auth: {
      getSession: async () => ({ data: { session: null }, error: new Error('Supabase not configured') }),
      signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
      signUp: async () => ({ error: new Error('Supabase not configured') }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: null, error: new Error('Supabase not configured') }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: null, error: new Error('Supabase not configured') }),
          }),
        }),
      }),
      upsert: async () => ({ error: new Error('Supabase not configured') }),
    }),
  };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Display a toast notification if Supabase is not configured
    if (!supabaseUrl || !supabaseKey) {
      toast({
        title: "Configuration Error",
        description: "Supabase is not properly configured. Please check your environment variables.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const getSession = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
        setIsLoading(false);
        return;
      }

      const session = data.session;
      if (session?.user) {
        // Fetch profile from DB
        const { data: profiles, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profiles && !profileError) {
          setUser({
            id: profiles.id,
            name: profiles.name,
            email: profiles.email,
            role: profiles.role,
            profileCompleted: profiles.profile_completed,
          });
        } else if (profileError) {
          console.error('Profile fetch error:', profileError);
        }
      }
      setIsLoading(false);
    };

    getSession();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profiles && !error) {
          setUser({
            id: profiles.id,
            name: profiles.name,
            email: profiles.email,
            role: profiles.role,
            profileCompleted: profiles.profile_completed,
          });
        }
      }
      if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem('user');
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      setIsLoading(false);
      throw new Error(error?.message || 'Invalid email or password');
    }

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (!profile || profileError) {
      setIsLoading(false);
      throw new Error('User profile not found or incomplete.');
    }

    const mappedUser: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      profileCompleted: profile.profile_completed,
    };

    localStorage.setItem('user', JSON.stringify(mappedUser));
    setUser(mappedUser);
    setIsLoading(false);

    // Redirect based on profile completion
    if (!mappedUser.profileCompleted) {
      navigate(mappedUser.role === 'doctor' ? '/doctor-profile' : '/patient-profile');
    } else {
      navigate('/dashboard');
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    setIsLoading(true);
    // Sign up with Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      setIsLoading(false);
      throw new Error(error?.message || 'Sign up failed');
    }

    // Insert or upsert in profiles
    const { error: insertError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: data.user.id,
          name,
          email,
          role,
          profile_completed: false,
        },
      ]);

    if (insertError) {
      setIsLoading(false);
      throw new Error(insertError.message || 'Profile creation failed');
    }

    const mappedUser: User = {
      id: data.user.id,
      name,
      email,
      role,
      profileCompleted: false,
    };

    localStorage.setItem('user', JSON.stringify(mappedUser));
    setUser(mappedUser);
    setIsLoading(false);

    navigate(role === 'doctor' ? '/doctor-profile' : '/patient-profile');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;

    // Always mark profile_completed as true when updating
    const newUser = { ...userData, profile_completed: true };
    const { data: updated, error } = await supabase
      .from('profiles')
      .update(newUser)
      .eq('id', user.id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error(error?.message || 'Profile update failed');
    }

    const profile: User = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      profileCompleted: updated.profile_completed,
    };

    localStorage.setItem('user', JSON.stringify(profile));
    setUser(profile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
