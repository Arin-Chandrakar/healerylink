import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
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
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);
  const navigate = useNavigate();

  const navigateBasedOnProfile = useCallback((userData: User) => {
    // Prevent multiple navigations
    if (hasNavigated) return;
    
    console.log('Checking navigation for user:', userData);
    
    // Only navigate if profile is not completed
    if (!userData.profileCompleted) {
      console.log('Profile not completed, navigating to profile page');
      setHasNavigated(true);
      
      if (userData.role === 'doctor') {
        console.log('Redirecting to doctor profile');
        navigate('/doctor-profile', { replace: true });
      } else if (userData.role === 'patient') {
        console.log('Redirecting to patient profile');  
        navigate('/patient-profile', { replace: true });
      }
    } else {
      console.log('Profile completed, staying on current page or going to dashboard');
    }
  }, [navigate, hasNavigated]);

  useEffect(() => {
    let mounted = true;
    
    console.log('AuthProvider: Starting initialization');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      if (session?.user) {
        console.log('User session found, fetching profile...');
        await fetchUserProfile(session.user);
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setIsLoading(false);
        setIsInitialized(true);
        setHasNavigated(false);
      }
    });

    // Check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting initial session:', error);
          if (mounted) {
            setIsLoading(false);
            setIsInitialized(true);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.email || 'No session');
        
        if (session?.user && mounted) {
          await fetchUserProfile(session.user);
        } else if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      console.log('User metadata:', authUser.user_metadata);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log('Profile query result:', { profile, error });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        // Don't throw - continue with fallback user data
      }

      let userData: User;

      if (profile && !error) {
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
        // Profile doesn't exist in DB or error occurred
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
      
      // Navigate based on profile completion status
      setTimeout(() => {
        navigateBasedOnProfile(userData);
      }, 100);
      
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error);
      
      // Create fallback user data
      const fallbackUser: User = {
        id: authUser.id,
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
        email: authUser.email || '',
        role: (authUser.user_metadata?.role as UserRole) || 'patient',
        profileCompleted: false,
      };
      
      console.log('Using fallback user data after error:', fallbackUser);
      setUser(fallbackUser);
      
      setTimeout(() => {
        navigateBasedOnProfile(fallbackUser);
      }, 100);
    } finally {
      console.log('Setting loading to false and initialized to true');
      setIsLoading(false);
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('Starting login process for:', email);
    setIsLoading(true);
    setHasNavigated(false);
    
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
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    console.log('Starting signup process for:', email);
    setIsLoading(true);
    setHasNavigated(false);
    
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

      if (data.user && !data.session) {
        console.log('Email confirmation required');
        setIsLoading(false);
        return { needsConfirmation: true };
      }

      console.log('Signup successful, session created');
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
    setHasNavigated(false);
    
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
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        console.log('Profile updated successfully:', updatedUser);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
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
    isInitialized,
    userEmail: user?.email,
    profileCompleted: user?.profileCompleted,
    hasNavigated
  });

  if (!isInitialized) {
    console.log('Still initializing, showing loading spinner');
    return (
      <AuthContext.Provider value={contextValue}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthContext.Provider>
    );
  }

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
