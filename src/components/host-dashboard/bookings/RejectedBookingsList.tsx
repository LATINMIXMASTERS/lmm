
import React from 'react';
import { BookingSlot } from '@/models/RadioStation';
import { BookingsTable } from './BookingsTable';
import { EmptyBookingsList } from './EmptyBookingsList';

interface RejectedBookingsListProps {
  bookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
  onDeleteBooking?: (bookingId: string) => void;
}

export const RejectedBookingsList: React.FC<RejectedBookingsListProps> = ({
  bookings,
  getStationName,
  formatDate,
  onDeleteBooking
}) => {
  if (bookings.length === 0) {
    return (
      <EmptyBookingsList message="You don't have any rejected booking requests" />
    );
  }
  
  return (
    <BookingsTable
      bookings={bookings}
      getStationName={getStationName}
      formatDate={formatDate}
      onDeleteBooking={onDeleteBooking}
      showRejectionReason={true}
    />
  );
};
