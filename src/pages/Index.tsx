import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CalendarClock, 
  MessageSquareText, 
  ClipboardCheck, 
  ShieldCheck, 
  HeartPulse, 
  BookOpen 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeatureCard from '@/components/FeatureCard';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    {
      icon: <CalendarClock className="h-6 w-6" />,
      title: 'Easy Scheduling',
      description: 'Book appointments with just a few clicks, 24/7 from any device.',
    },
    {
      icon: <MessageSquareText className="h-6 w-6" />,
      title: 'Secure Messaging',
      description: 'Communicate with doctors through our encrypted messaging system.',
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: 'Digital Records',
      description: 'Access your medical records and history anytime, anywhere.',
    },
    {
      icon: <ShieldCheck className="h-6 w-6" />,
      title: 'Verified Professionals',
      description: 'All healthcare providers are verified and credentialed.',
    },
    {
      icon: <HeartPulse className="h-6 w-6" />,
      title: 'Health Monitoring',
      description: 'Track your health metrics and share with your doctor in real-time.',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: 'Health Resources',
      description: 'Access a library of medical articles and resources.',
    },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              Why Choose HEATHER?
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="text-lg text-gray-600 max-w-2xl mx-auto"
            >
              Our platform simplifies healthcare by connecting patients with doctors through innovative technology.
            </motion.p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* For Doctors Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">For Doctors</h2>
              <p className="text-lg text-gray-600 mb-6">
                Expand your practice and reach more patients. Our platform provides doctors with tools to manage appointments, communicate with patients, and grow their practice.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Streamline patient management',
                  'Reduce administrative work',
                  'Build your online reputation',
                  'Connect with patients securely',
                  'Flexible schedule management',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/sign-up">
                <Button className="btn-primary">
                  Join as a Doctor
                </Button>
              </Link>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-50 to-blue-100 rounded-3xl transform -rotate-2 scale-105 shadow-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1674&q=80" 
                  alt="Doctor with digital tablet" 
                  className="relative z-10 w-full h-auto rounded-2xl shadow-md"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* For Patients Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col-reverse lg:flex-row items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2 mt-10 lg:mt-0"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-cyan-50 rounded-3xl transform rotate-2 scale-105 shadow-lg"></div>
                <img 
                  src="https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1480&q=80" 
                  alt="Patient using digital device" 
                  className="relative z-10 w-full h-auto rounded-2xl shadow-md"
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="lg:w-1/2 lg:pl-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">For Patients</h2>
              <p className="text-lg text-gray-600 mb-6">
                Find and connect with qualified healthcare providers. Schedule appointments, communicate securely, and manage your health records all in one place.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Find doctors that match your needs',
                  'Book appointments 24/7',
                  'Secure messaging with healthcare providers',
                  'Store and access your medical history',
                  'Get reminders for appointments and medications',
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center mr-2">
                      <span className="w-2 h-2 bg-primary rounded-full"></span>
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link to="/sign-up">
                <Button className="btn-primary">
                  Join as a Patient
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold mb-4"
          >
            Ready to transform your healthcare experience?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-2xl mx-auto mb-8"
          >
            Join thousands of patients and doctors who are already using HEATHER to streamline healthcare.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {!isAuthenticated && (
              <>
                <Link to="/sign-up">
                  <Button className="btn-primary w-full sm:w-auto">
                    Create an Account
                  </Button>
                </Link>
                <Link to="/sign-in">
                  <Button className="btn-outline w-full sm:w-auto">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
            {isAuthenticated && (
              <Link to="/dashboard">
                <Button className="btn-primary w-full sm:w-auto">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-10 bg-white border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-xl font-semibold text-primary">HEATHER</span>
              <p className="text-sm text-gray-500 mt-1">
                Connecting doctors and patients seamlessly.
              </p>
            </div>
            
            <div className="flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">About</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-gray-500 hover:text-primary transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="text-center mt-8 text-sm text-gray-500">
            &copy; {new Date().getFullYear()} HEATHER. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
