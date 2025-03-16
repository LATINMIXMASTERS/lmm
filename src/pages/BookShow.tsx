
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import BookingForm from '@/components/book-show/BookingForm';
import StationInfoCard from '@/components/book-show/StationInfoCard';
import { useBookShow } from '@/hooks/useBookShow';

const BookShow: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const {
    station,
    isPrivilegedUser,
    userId,
    username,
    hasBookingConflict,
    handleBookShow
  } = useBookShow(stationId);

  if (!station || !isPrivilegedUser) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Book a Show on {station.name}</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <BookingForm
              station={station}
              isVerifiedHost={isPrivilegedUser}
              userId={userId}
              username={username}
              onBookShow={handleBookShow}
              hasBookingConflict={hasBookingConflict}
              onCancel={() => window.history.back()}
            />
          </div>
          
          <div>
            <StationInfoCard station={station} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BookShow;
