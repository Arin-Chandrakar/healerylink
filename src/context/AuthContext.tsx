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
  const navigate = useNavigate();

  const navigateAfterAuth = useCallback(() => {
    if (!user) return;
    
    console.log('Navigating after sign in/up, user:', user);
    
    // If profile is not completed, redirect to appropriate profile page
    if (!user.profileCompleted) {
      if (user.role === 'doctor') {
        console.log('Redirecting to doctor profile');
        navigate('/doctor-profile');
      } else if (user.role === 'patient') {
        console.log('Redirecting to patient profile');
        navigate('/patient-profile');
      }
    } else {
      console.log('Profile completed, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;
    let profileFetchTimeout: NodeJS.Timeout;

    console.log('AuthProvider: Starting initialization');

    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      // Clear any existing timeout
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }

      if (session?.user) {
        console.log('User session found, fetching profile...');
        
        // Set a timeout to prevent hanging indefinitely
        profileFetchTimeout = setTimeout(() => {
          console.log('Profile fetch timeout, using fallback user data');
          if (mounted) {
            const fallbackUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              role: (session.user.user_metadata?.role as UserRole) || 'patient',
              profileCompleted: false,
            };
            setUser(fallbackUser);
            setIsLoading(false);
            setIsInitialized(true);
          }
        }, 10000);

        try {
          await fetchUserProfile(session.user);
          if (profileFetchTimeout) {
            clearTimeout(profileFetchTimeout);
          }
        } catch (error) {
          console.error('Profile fetch failed, using fallback');
          if (profileFetchTimeout) {
            clearTimeout(profileFetchTimeout);
          }
        }
        
        // Navigate after successful authentication
        if (event === 'SIGNED_IN' && mounted) {
          console.log('Navigating after sign in');
          setTimeout(() => {
            // Check if profile is completed and navigate accordingly
            const userRole = session.user.user_metadata?.role;
            if (!session.user.user_metadata?.profileCompleted) {
              if (userRole === 'doctor') {
                navigate('/doctor-profile');
              } else {
                navigate('/patient-profile');
              }
            } else {
              navigate('/dashboard');
            }
          }, 100);
        }
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    // Then check for existing session with timeout
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session...');
        
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session check timeout')), 5000)
        );
        
        const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]) as any;
        
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
      if (profileFetchTimeout) {
        clearTimeout(profileFetchTimeout);
      }
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated && user && !isLoading) {
      navigateAfterAuth();
    }
  }, [isAuthenticated, user, isLoading, navigateAfterAuth]);

  const fetchUserProfile = async (authUser: SupabaseUser) => {
    try {
      console.log('Fetching profile for user:', authUser.id);
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000)
      );
      
      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

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
      setIsInitialized(true);
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
    isInitialized,
    userEmail: user?.email,
    profileCompleted: user?.profileCompleted
  });

  if (!isInitialized) {
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
