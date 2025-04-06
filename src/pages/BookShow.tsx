
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useRadio } from '@/hooks/useRadioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useBookShow } from '@/hooks/useBookShow';
import StationInfoCard from '@/components/book-show/StationInfoCard';
import BookingForm from '@/components/book-show/BookingForm';

const BookShow: React.FC = () => {
  const { stations } = useRadio();
  const { user } = useAuth();
  const bookingState = useBookShow();
  const { 
    selectedStation, 
    setSelectedStation, 
    title, 
    setTitle, 
    startDate, 
    setStartDate, 
    endDate, 
    setEndDate, 
    error, 
    success,
    handleSubmit 
  } = bookingState;
  
  // Find the selected station object
  const station = stations.find(s => s.id === selectedStation);
  
  // Check if user has privileges
  const isPrivilegedUser = !!user?.isAdmin || stations.some(
    station => station.hosts.some(host => host.id === user?.id)
  );
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Book a Radio Show</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <BookingForm
              stations={stations}
              selectedStation={selectedStation}
              setSelectedStation={setSelectedStation}
              title={title}
              setTitle={setTitle}
              startDate={startDate}
              setStartDate={setStartDate}
              endDate={endDate}
              setEndDate={setEndDate}
              error={error}
              success={success}
              handleSubmit={handleSubmit}
              isPrivilegedUser={isPrivilegedUser}
              userId={user?.id}
              username={user?.username} 
            />
          </div>
          
          <div>
            {station && (
              <StationInfoCard
                station={station}
                isPrivilegedUser={isPrivilegedUser}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookShow;
