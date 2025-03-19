
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';

const SignIn = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-20 pb-10">
        <div className="max-w-6xl mx-auto mt-16 flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-xl">
          {/* Left Side - Image and Text */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 relative overflow-hidden hidden lg:block"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/90 to-blue-700/90 z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80" 
              alt="Healthcare professionals" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="relative z-20 p-10 h-full flex flex-col justify-center">
              <div className="max-w-md">
                <h1 className="text-3xl font-bold mb-4 text-white">Welcome Back</h1>
                <p className="text-blue-100 mb-6">
                  Sign in to access your HEATHER account and continue connecting with healthcare professionals or patients.
                </p>
                
                <div className="space-y-6 mb-8">
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                    <p className="text-white italic">
                      "HEATHER has transformed how I connect with patients. The platform is intuitive and has helped me grow my practice significantly."
                    </p>
                    <div className="mt-3 flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-400 flex items-center justify-center text-white font-bold">D</div>
                      <div className="ml-3">
                        <p className="text-white font-medium">Dr. Johnson</p>
                        <p className="text-blue-200 text-xs">Cardiologist</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Right Side - Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:w-1/2 bg-white p-10 flex flex-col justify-center"
          >
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">Sign In</h2>
              <AuthForm mode="signin" />
              
              <div className="mt-8 text-center lg:text-left">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/sign-up" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
