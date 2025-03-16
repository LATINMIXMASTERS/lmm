
import { BookingSlot } from '@/models/RadioStation';
import { createBooking } from '@/services/bookingService';
import { isPast } from 'date-fns';

export const useAddBookingAction = (
  bookings: BookingSlot[],
  dispatch: React.Dispatch<any>
) => {
  const addBookingImpl = (bookingData: Omit<BookingSlot, 'id'>) => {
    // Validate that the booking is not in the past
    const startTime = new Date(bookingData.startTime);
    if (isPast(startTime)) {
      console.error("Cannot book shows in the past");
      return null;
    }
    
    const newBooking = createBooking(bookings, bookingData);
    
    // Update state
    dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify([...bookings, newBooking]));
    
    return newBooking;
  };

  return {
    addBooking: addBookingImpl
  };
};
