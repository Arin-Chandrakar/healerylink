
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();

  const navigateBasedOnProfile = useCallback((userData: User, isNewSignup = false) => {
    console.log('Checking navigation for user:', userData, 'isNewSignup:', isNewSignup);
    
    // Define pages where we should NOT redirect users
    const functionalPages = ['/dashboard', '/health-analysis', '/book-appointment', '/messages'];
    const profilePages = ['/doctor-profile', '/patient-profile'];
    
    // If user is on a functional page and profile is completed, don't redirect
    if (functionalPages.includes(location.pathname) && userData.profileCompleted) {
      console.log('User is on a functional page with completed profile, not redirecting');
      return;
    }
    
    // If user is on a profile page, don't redirect (they're already completing it)
    if (profilePages.includes(location.pathname)) {
      console.log('User is on a profile page, not redirecting');
      return;
    }
    
    // Only redirect to profile completion if:
    // 1. Profile is not completed AND
    // 2. It's a new signup OR user is on auth pages
    const authPages = ['/sign-in', '/sign-up', '/'];
    const shouldRedirectToProfile = !userData.profileCompleted && 
      (isNewSignup || authPages.includes(location.pathname));
    
    if (shouldRedirectToProfile) {
      console.log('Redirecting to profile completion');
      
      if (userData.role === 'doctor') {
        console.log('Redirecting to doctor profile');
        navigate('/doctor-profile', { replace: true });
      } else if (userData.role === 'patient') {
        console.log('Redirecting to patient profile');  
        navigate('/patient-profile', { replace: true });
      }
    } else if (userData.profileCompleted && authPages.includes(location.pathname)) {
      // If profile is completed and user is on auth pages, redirect to dashboard
      console.log('Profile completed, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    let mounted = true;
    
    console.log('AuthProvider: Starting initialization');

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      if (session?.user) {
        console.log('User session found, fetching profile...');
        const isNewSignup = event === 'SIGNED_UP';
        await fetchUserProfile(session.user, isNewSignup);
      } else {
        console.log('No session, clearing user state');
        setUser(null);
        setIsLoading(false);
        setIsInitialized(true);
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
          await fetchUserProfile(session.user, false);
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

  const fetchUserProfile = async (authUser: SupabaseUser, isNewSignup = false) => {
    try {
      console.log('Fetching profile for user:', authUser.id, 'isNewSignup:', isNewSignup);
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        console.error('Error fetching profile:', error);
        // Don't throw - handle gracefully
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
        // Profile doesn't exist in DB, so it's not completed
        userData = {
          id: authUser.id,
          name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
          email: authUser.email || '',
          role: (authUser.user_metadata?.role as UserRole) || 'patient',
          profileCompleted: false,
        };
        console.log('Using user data without profile (not completed):', userData);
      }
      
      setUser(userData);
      
      // Navigate based on profile completion status
      setTimeout(() => {
        navigateBasedOnProfile(userData, isNewSignup);
      }, 100);
      
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
      
      setTimeout(() => {
        navigateBasedOnProfile(fallbackUser, isNewSignup);
      }, 100);
    } finally {
      console.log('Profile fetch completed, setting loading to false');
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
    currentPath: location.pathname
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
