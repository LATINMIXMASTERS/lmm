
import { BookingSlot } from '@/models/RadioStation';

export const useCancelBookingAction = (
  bookings: BookingSlot[],
  dispatch: React.Dispatch<any>
) => {
  const cancelBookingImpl = (bookingId: string) => {
    dispatch({ type: 'DELETE_BOOKING', payload: bookingId });
    
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been canceled`);
  };

  return {
    cancelBooking: cancelBookingImpl
  };
};
