
import React from 'react';
import { BookingSlot } from '@/models/RadioStation';
import { BookingsTable } from './BookingsTable';
import { EmptyBookingsList } from './EmptyBookingsList';

interface PendingBookingsListProps {
  bookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
  onDeleteBooking?: (bookingId: string) => void;
}

export const PendingBookingsList: React.FC<PendingBookingsListProps> = ({
  bookings,
  getStationName,
  formatDate,
  onDeleteBooking
}) => {
  if (bookings.length === 0) {
    return (
      <EmptyBookingsList message="You don't have any pending booking requests" />
    );
  }
  
  return (
    <BookingsTable
      bookings={bookings}
      getStationName={getStationName}
      formatDate={formatDate}
      onDeleteBooking={onDeleteBooking}
      showStatus={true}
    />
  );
};
