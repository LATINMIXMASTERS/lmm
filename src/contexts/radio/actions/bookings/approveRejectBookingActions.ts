
import { BookingSlot } from '@/models/RadioStation';

export const useApproveRejectBookingActions = (
  bookings: BookingSlot[],
  dispatch: React.Dispatch<any>
) => {
  const approveBookingImpl = (bookingId: string) => {
    dispatch({ type: 'APPROVE_BOOKING', payload: bookingId });
    
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: true, 
        rejected: false,
        rejectionReason: undefined 
      } : booking
    );
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };
  
  const rejectBookingImpl = (bookingId: string, reason: string) => {
    dispatch({ type: 'REJECT_BOOKING', payload: { bookingId, reason } });
    
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: false, 
        rejected: true,
        rejectionReason: reason 
      } : booking
    );
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };

  return {
    approveBooking: approveBookingImpl,
    rejectBooking: rejectBookingImpl
  };
};
