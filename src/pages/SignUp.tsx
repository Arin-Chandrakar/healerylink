
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import AuthForm from '@/components/AuthForm';

const SignUp = () => {
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
            className="lg:w-1/2 bg-primary p-10 text-white flex flex-col justify-center"
          >
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold mb-4">Join HEATHER</h1>
              <p className="text-blue-100 mb-6">
                Create an account to connect with healthcare professionals or find patients who need your expertise.
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold">1</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">Create your account</h3>
                    <p className="text-blue-100 text-sm">Fill in your details and choose your role</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold">2</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">Complete your profile</h3>
                    <p className="text-blue-100 text-sm">Add your professional or personal information</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-400 flex items-center justify-center mt-0.5">
                    <span className="text-sm font-bold">3</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold">Start connecting</h3>
                    <p className="text-blue-100 text-sm">Find doctors or patients according to your needs</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center lg:text-left">
                <p className="text-blue-100">
                  Already have an account?{' '}
                  <Link to="/sign-in" className="text-white underline hover:text-blue-200 font-medium">
                    Sign in
                  </Link>
                </p>
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
              <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">Create an Account</h2>
              <AuthForm mode="signup" />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
