
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/use-toast';
import { Stethoscope, User, Mail, CheckCircle } from 'lucide-react';
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
  const { login, signup } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Determine which schema to use based on mode
  const schema = mode === 'signin' ? signInSchema : signUpSchema;
  
  // Use proper default values for the form
  const form = useForm<SignInValues | SignUpValues>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signin' 
      ? { email: '', password: '' } 
      : { name: '', email: '', password: '', role: 'patient' }, // Set a default role
  });

  const onSubmit = async (values: SignInValues | SignUpValues) => {
    setIsSubmitting(true);
    
    try {
      if (mode === 'signin') {
        const { email, password } = values as SignInValues;
        console.log('Attempting sign in with:', email);
        await login(email, password);
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        const { name, email, password, role } = values as SignUpValues;
        console.log('Attempting sign up with:', email);
        const result = await signup(name, email, password, role);
        
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
    } catch (error) {
      console.error('Auth form error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      // Always reset loading state
      setIsSubmitting(false);
      console.log('Form submission completed, resetting loading state');
    }
  };

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
                    <Input placeholder="John Doe" {...field} />
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
                  <Input type="email" placeholder="you@example.com" {...field} />
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
                  <Input type="password" placeholder="••••••••" {...field} />
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
                    >
                      <div className="flex-1">
                        <FormItem className="glass hover:shadow-md transition-all duration-300 rounded-lg p-4 [&:has([data-state=checked])]:border-primary [&:has([data-state=checked])]:ring-1 [&:has([data-state=checked])]:ring-primary">
                          <FormControl>
                            <RadioGroupItem value="doctor" className="sr-only" id="role-doctor" />
                          </FormControl>
                          <div className="flex flex-col items-center justify-center gap-2 p-2 cursor-pointer" onClick={() => field.onChange("doctor")}>
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
                          <div className="flex flex-col items-center justify-center gap-2 p-2 cursor-pointer" onClick={() => field.onChange("patient")}>
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
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AuthForm;
