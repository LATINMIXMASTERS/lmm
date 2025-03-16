
import { BookingSlot } from '@/models/RadioStation';
import { canUpdateBooking } from '@/services/bookingService';
import { isPast } from 'date-fns';

export const useUpdateBookingAction = (
  bookings: BookingSlot[],
  dispatch: React.Dispatch<any>
) => {
  const updateBookingImpl = (bookingId: string, updatedBookingData: Partial<BookingSlot>) => {
    // Check if updating times and if they're in the past
    if (updatedBookingData.startTime) {
      const startTime = new Date(updatedBookingData.startTime);
      if (isPast(startTime)) {
        console.error("Cannot update to a time in the past");
        return null;
      }
    }
    
    if (!canUpdateBooking(bookings, bookingId, updatedBookingData)) {
      return null;
    }
    
    const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
    const updatedBooking = { ...bookings[bookingIndex], ...updatedBookingData };
    
    dispatch({ type: 'UPDATE_BOOKING', payload: updatedBooking });
    
    const updatedBookings = bookings.map((booking, index) => {
      if (index === bookingIndex) {
        return updatedBooking;
      }
      return booking;
    });
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been updated:`, updatedBooking);
    return updatedBooking;
  };

  return {
    updateBooking: updateBookingImpl
  };
};
