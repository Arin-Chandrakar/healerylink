
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const HeroSection = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-white -z-10"></div>
      
      {/* Animated circles */}
      <div className="absolute -z-10 w-full h-full overflow-hidden opacity-30">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-subtle"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-subtle animation-delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/3 w-72 h-72 bg-cyan-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-pulse-subtle animation-delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 py-10 flex flex-col lg:flex-row items-center">
        {/* Text content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-1 text-center lg:text-left lg:pr-12"
        >
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mb-6">
            Connecting health professionals with patients
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-gray-900">
            Healthcare <span className="text-primary">simplified</span> for everyone
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
            Connect with qualified doctors or find patients who need your expertise - all in one seamless platform designed for modern healthcare needs.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <Link to="/sign-up">
              <Button className="btn-primary w-full sm:w-auto group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/sign-in">
              <Button className="btn-outline w-full sm:w-auto">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>
        
        {/* Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex-1 mt-12 lg:mt-0"
        >
          <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-50 rounded-3xl transform rotate-3 scale-105 shadow-lg"></div>
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
              alt="Doctor with patient" 
              className="relative z-10 w-full h-auto rounded-2xl shadow-md"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
