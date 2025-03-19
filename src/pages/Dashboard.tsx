
import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/context/AuthContext';
import { CalendarClock, Clock, MessageSquare, Search, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for doctors and appointments
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

const mockPatients = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    location: 'Brooklyn, NY',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    name: 'Emma Thompson',
    age: 28,
    location: 'Los Angeles, CA',
    imageUrl: 'https://randomuser.me/api/portraits/women/26.jpg',
  },
  {
    id: '3',
    name: 'Robert Garcia',
    age: 36,
    location: 'Miami, FL',
    imageUrl: 'https://randomuser.me/api/portraits/men/76.jpg',
  },
  {
    id: '4',
    name: 'Lisa Kim',
    age: 52,
    location: 'Seattle, WA',
    imageUrl: 'https://randomuser.me/api/portraits/women/90.jpg',
  },
];

const mockAppointments = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Johnson',
    patientName: 'John Smith',
    date: '2023-11-15',
    time: '10:00 AM',
    status: 'upcoming',
    reason: 'Annual checkup',
    doctorImage: 'https://randomuser.me/api/portraits/women/44.jpg',
    patientImage: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    patientName: 'Emma Thompson',
    date: '2023-11-16',
    time: '2:30 PM',
    status: 'upcoming',
    reason: 'Skin consultation',
    doctorImage: 'https://randomuser.me/api/portraits/men/46.jpg',
    patientImage: 'https://randomuser.me/api/portraits/women/26.jpg',
  },
];

const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
    return <Navigate to="/sign-in" />;
  }

  // Filter data based on search query
  const filteredDoctors = mockDoctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPatients = mockPatients.filter(patient => 
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass rounded-2xl p-6 md:p-8 shadow-sm mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Welcome, {user?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {user?.role === 'doctor' ? 'Your patient dashboard' : 'Your health dashboard'}
              </p>
            </div>
            
            <div className="flex-1 md:flex-initial w-full md:w-auto md:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder={user?.role === 'doctor' ? 'Search patients...' : 'Search doctors...'}
                  className="pl-10 pr-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </motion.div>
        
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 h-14 glass">
            <TabsTrigger value="overview" className="data-[state=active]:glass-dark">Overview</TabsTrigger>
            <TabsTrigger value="appointments" className="data-[state=active]:glass-dark">Appointments</TabsTrigger>
            <TabsTrigger value="messages" className="data-[state=active]:glass-dark">Messages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8 animate-fade-in">
            {/* Quick stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="glass rounded-xl p-6 flex items-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-primary">
                  <CalendarClock className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Upcoming</p>
                  <h3 className="text-2xl font-bold">{mockAppointments.length}</h3>
                  <p className="text-gray-500 text-sm">Appointments</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-6 flex items-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">New</p>
                  <h3 className="text-2xl font-bold">5</h3>
                  <p className="text-gray-500 text-sm">Messages</p>
                </div>
              </div>
              
              <div className="glass rounded-xl p-6 flex items-center">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <User className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-gray-500 text-sm">Total</p>
                  <h3 className="text-2xl font-bold">
                    {user?.role === 'doctor' ? mockPatients.length : mockDoctors.length}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {user?.role === 'doctor' ? 'Patients' : 'Available Doctors'}
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Doctors or Patients List */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {user?.role === 'doctor' ? 'Your Patients' : 'Recommended Doctors'}
                </h2>
                <Button variant="outline" className="text-primary border-primary">
                  View All
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {user?.role === 'doctor' ? (
                  filteredPatients.length > 0 ? (
                    filteredPatients.map((patient) => (
                      <ProfileCard
                        key={patient.id}
                        name={patient.name}
                        location={patient.location}
                        imageUrl={patient.imageUrl}
                        isDoctor={false}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No patients found matching your search.</p>
                    </div>
                  )
                ) : (
                  filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doctor) => (
                      <ProfileCard
                        key={doctor.id}
                        name={doctor.name}
                        specialty={doctor.specialty}
                        location={doctor.location}
                        rating={doctor.rating}
                        verified={doctor.verified}
                        imageUrl={doctor.imageUrl}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <p className="text-gray-500">No doctors found matching your search.</p>
                    </div>
                  )
                )}
              </div>
            </motion.div>
          </TabsContent>
          
          <TabsContent value="appointments" className="animate-fade-in">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Upcoming Appointments</h2>
              
              {mockAppointments.length > 0 ? (
                <div className="space-y-4">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="glass-dark p-4 rounded-xl flex items-center justify-between">
                      <div className="flex items-center">
                        <img 
                          src={user?.role === 'doctor' ? appointment.patientImage : appointment.doctorImage}
                          alt={user?.role === 'doctor' ? appointment.patientName : appointment.doctorName}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="ml-4">
                          <h3 className="font-medium">
                            {user?.role === 'doctor' ? appointment.patientName : appointment.doctorName}
                          </h3>
                          <p className="text-sm text-gray-500">{appointment.reason}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <div className="mr-6 text-right">
                          <div className="flex items-center text-gray-600 mb-1">
                            <CalendarClock className="h-4 w-4 mr-1" />
                            <span className="text-sm">{appointment.date}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Clock className="h-4 w-4 mr-1" />
                            <span className="text-sm">{appointment.time}</span>
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" className="bg-white text-primary hover:bg-primary hover:text-white">
                          Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <CalendarClock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No upcoming appointments</h3>
                  <p className="text-gray-500 mb-4">You have no appointments scheduled.</p>
                  <Button className="btn-primary">Schedule an Appointment</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="messages" className="animate-fade-in">
            <div className="glass rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-6">Messages</h2>
              
              <div className="text-center py-10">
                <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No messages yet</h3>
                <p className="text-gray-500 mb-4">
                  {user?.role === 'doctor' 
                    ? 'Start the conversation with your patients.' 
                    : 'Connect with a doctor to start messaging.'}
                </p>
                <Button className="btn-primary">
                  {user?.role === 'doctor' ? 'Message a Patient' : 'Find a Doctor'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
