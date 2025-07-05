
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/hooks/use-toast';
import { Stethoscope, User, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';

// Define schemas for sign in and sign up
const signInSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  role: z.enum(['doctor', 'patient'], { required_error: 'Please select a role' }),
});

type SignInValues = z.infer<typeof signInSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

const AuthForm = ({ mode }: AuthFormProps) => {
  const { login, signup, isLoading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [connectionError, setConnectionError] = useState(false);

  // Determine which schema to use based on mode
  const schema = mode === 'signin' ? signInSchema : signUpSchema;
  
  // Use proper default values for the form
  const form = useForm<SignInValues | SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signin' 
      ? { email: '', password: '' } 
      : { name: '', email: '', password: '', role: 'patient' },
  });

  const onSubmit = async (values: SignInValues | SignUpValues) => {
    console.log(`Starting ${mode} process...`);
    setIsSubmitting(true);
    setConnectionError(false);
    
    // Set a timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      console.log('Auth operation timeout');
      setIsSubmitting(false);
      toast({
        title: "Operation Timeout",
        description: "The authentication process is taking too long. Please try again.",
        variant: "destructive",
      });
    }, 30000); // 30 second timeout
    
    try {
      if (mode === 'signin') {
        const { email, password } = values as SignInValues;
        console.log('Attempting sign in with:', email);
        await login(email, password);
        
        clearTimeout(timeoutId);
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        const { name, email, password, role } = values as SignUpValues;
        console.log('Attempting sign up with:', email);
        const result = await signup(name, email, password, role);
        
        clearTimeout(timeoutId);
        
        if (result.needsConfirmation) {
          setShowConfirmation(true);
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link to complete your registration.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "Your account has been successfully created.",
          });
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.error('Auth form error:', error);
      
      let errorMessage = "An unexpected error occurred. Please try again.";
      
      // Handle specific error types
      if (error?.message?.includes('{}') || error?.status === 503 || error?.message?.includes('Failed to fetch')) {
        setConnectionError(true);
        errorMessage = "Unable to connect to authentication service. Please check your internet connection and try again.";
      } else if (error?.message?.includes('Invalid login credentials')) {
        errorMessage = "Invalid email or password. Please check your credentials and try again.";
      } else if (error?.message?.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
      } else if (error?.message?.includes('timeout') || error?.message?.includes('Timeout')) {
        errorMessage = "The request timed out. Please try again.";
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      console.log('Form submission completed, resetting loading state');
      setIsSubmitting(false);
    }
  };

  // Show connection error state
  if (connectionError) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="p-8 rounded-lg bg-red-50 border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-700 mb-4">
            We're having trouble connecting to our authentication service. This might be a temporary issue.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-red-600">Please try:</p>
            <ul className="text-sm text-red-600 list-disc list-inside space-y-1">
              <li>Checking your internet connection</li>
              <li>Refreshing the page</li>
              <li>Trying again in a few moments</li>
            </ul>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setConnectionError(false);
            form.reset();
          }}
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (showConfirmation) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-6">
        <div className="p-8 rounded-lg bg-green-50 border border-green-200">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-green-800 mb-2">Check Your Email</h3>
          <p className="text-green-700 mb-4">
            We've sent you a confirmation link. Please check your email and click the link to activate your account.
          </p>
          <div className="flex items-center justify-center text-sm text-green-600">
            <Mail className="w-4 h-4 mr-2" />
            <span>Confirmation email sent</span>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={() => setShowConfirmation(false)}
          className="w-full"
        >
          Back to Sign Up
        </Button>
      </div>
    );
  }

  const isLoading = isSubmitting || authLoading;

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} disabled={isLoading} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {mode === 'signup' && (
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>I am a</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex gap-4"
                      disabled={isLoading}
                    >
                      <div className="flex-1">
                        <FormItem className="glass hover:shadow-md transition-all duration-300 rounded-lg p-4 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-primary">
                          <FormControl>
                            <RadioGroupItem value="doctor" className="sr-only" id="role-doctor" />
                          </FormControl>
                          <div className="flex flex-col items-center justify-center gap-2 p-2 cursor-pointer" onClick={() => !isLoading && field.onChange("doctor")}>
                            <Stethoscope className="h-8 w-8 text-primary" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="role-doctor">Doctor</FormLabel>
                          </div>
                        </FormItem>
                      </div>
                      
                      <div className="flex-1">
                        <FormItem className="glass hover:shadow-md transition-all duration-300 rounded-lg p-4 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-primary">
                          <FormControl>
                            <RadioGroupItem value="patient" className="sr-only" id="role-patient" />
                          </FormControl>
                          <div className="flex flex-col items-center justify-center gap-2 p-2 cursor-pointer" onClick={() => !isLoading && field.onChange("patient")}>
                            <User className="h-8 w-8 text-primary" />
                            <FormLabel className="font-normal cursor-pointer" htmlFor="role-patient">Patient</FormLabel>
                          </div>
                        </FormItem>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          
          <Button 
            type="submit" 
            className="w-full btn-primary" 
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {mode === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </span>
            ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthForm;
