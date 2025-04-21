
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, Calendar } from 'lucide-react';
import { toast } from 'sonner';

// Mock doctors data (you would normally fetch this from an API)
const mockDoctors = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    location: 'New York, NY',
    rating: 4.9,
    verified: true,
    imageUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Dermatologist',
    location: 'San Francisco, CA',
    rating: 4.7,
    verified: true,
    imageUrl: 'https://randomuser.me/api/portraits/men/46.jpg',
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Pediatrician',
    location: 'Chicago, IL',
    rating: 4.8,
    verified: true,
    imageUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    location: 'Austin, TX',
    rating: 4.6,
    verified: false,
    imageUrl: 'https://randomuser.me/api/portraits/men/22.jpg',
  },
];

const BookAppointment = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<typeof mockDoctors[0] | null>(null);
  
  // Get the doctor ID from URL params
  const doctorId = searchParams.get('doctorId');
  
  useEffect(() => {
    // Find the doctor in our mock data
    if (doctorId) {
      const foundDoctor = mockDoctors.find(doc => doc.id === doctorId);
      if (foundDoctor) {
        setDoctor(foundDoctor);
      } else {
        // Doctor not found
        toast.error("Doctor not found");
        navigate('/dashboard');
      }
    } else {
      // No doctor ID provided
      toast.error("No doctor specified");
      navigate('/dashboard');
    }
  }, [doctorId, navigate]);
  
  const handleBookAppointment = () => {
    toast.success("Appointment request sent!");
    setTimeout(() => {
      navigate('/dashboard');
    }, 1500);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    navigate('/sign-in');
    return null;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-10">
        <Button 
          variant="ghost" 
          className="mb-6 flex items-center gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Button>
        
        {doctor && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-6 md:p-8 shadow-sm"
          >
            <div className="flex flex-col md:flex-row gap-6 mb-8">
              <div className="flex-shrink-0">
                <img 
                  src={doctor.imageUrl} 
                  alt={doctor.name}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>
              
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {doctor.name}
                </h1>
                <p className="text-gray-600 mb-2">{doctor.specialty}</p>
                <p className="text-gray-600 mb-4">{doctor.location}</p>
                <div className="flex items-center">
                  <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                    Available Today
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-center py-10">
              <Calendar className="h-16 w-16 mx-auto text-primary mb-6" />
              <h2 className="text-xl font-semibold mb-2">Book an Appointment</h2>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                This feature is coming soon! In the meantime, click the button below to simulate booking an appointment with {doctor.name}.
              </p>
              
              <Button 
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-full"
                onClick={handleBookAppointment}
              >
                Request Appointment
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BookAppointment;
