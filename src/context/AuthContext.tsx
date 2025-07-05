
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

export type UserRole = 'doctor' | 'patient' | null;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileCompleted?: boolean;
  imageUrl?: string;
  location?: string;
  specialty?: string;
  verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ needsConfirmation?: boolean }>;
  logout: () => void;
  updateUserProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      if (session?.user) {
        console.log('User session found, fetching profile...');
        await fetchUserProfile(session.user);
        
        // Navigate to dashboard after successful authentication and profile fetch
        if (event === 'SIGNED_IN') {
          console.log('Navigating to dashboard after sign in');
          setTimeout(() => navigate('/dashboard'), 100);
        }
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setIsLoading(false);
      }
    });

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          setIsLoading(false);
          return;
        }

        console.log('Initial session check:', session?.user?.email);
        
        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        throw error;
      }

      let userData: User;

      if (profile) {
        userData = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role as UserRole,
          profileCompleted: true,
          imageUrl: profile.image_url,
          location: profile.location,
          specialty: profile.specialty,
          verified: profile.verified,
        };
        console.log('Setting user from profile:', userData);
      } else {
        // Create fallback user from auth metadata
        userData = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: (authUser.user_metadata?.role as UserRole) || 'patient',
          profileCompleted: false,
        };
        console.log('Using fallback user data:', userData);
      }
      
      setUser(userData);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      
      // Always create fallback user to prevent auth blocking
      const fallbackUser: User = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as UserRole) || 'patient',
        profileCompleted: false,
      };
      
      console.log('Using fallback user data after error:', fallbackUser);
      setUser(fallbackUser);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Starting login process for:', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.email);
      // User profile will be fetched and navigation will happen in the auth state change listener
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    console.log('Starting signup process for:', email);
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        throw error;
      }

      console.log('Signup response:', data);

      // Check if user needs email confirmation
      if (data.user && !data.session) {
        console.log('Email confirmation required');
        setIsLoading(false);
        return { needsConfirmation: true };
      }

      console.log('Signup successful, session created');
      // If session exists, the auth state change listener will handle navigation
      return {};
    } catch (error) {
      console.error('Signup process error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          location: userData.location,
          specialty: userData.specialty,
          image_url: userData.imageUrl,
        })
        .eq('id', user.id);

      if (!error) {
        setUser({ ...user, ...userData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      // Still update local state even if database update fails
      setUser({ ...user, ...userData });
    }
  };

  const contextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateUserProfile,
  };

  console.log('Auth context state:', { 
    isAuthenticated: !!user, 
    isLoading, 
    userEmail: user?.email 
  });

  return (
    <AuthContext.Provider value={contextValue}>
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
