
import { BookingSlot } from '@/models/RadioStation';
import { createBooking, canUpdateBooking } from '@/services/bookingService';
import { hasBookingConflict, getBookingsForStation, getBookingsForToday } from '@/utils/radioUtils';
import { isPast } from 'date-fns';

export const useBookingActions = (
  state: { bookings: BookingSlot[] }, 
  dispatch: React.Dispatch<any>
) => {
  const getBookingsForStationImpl = (stationId: string) => getBookingsForStation(state.bookings, stationId);
  
  const getBookingsForTodayImpl = (stationId: string) => getBookingsForToday(state.bookings, stationId);
  
  const hasBookingConflictImpl = (stationId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => {
    return hasBookingConflict(state.bookings, stationId, startTime, endTime, excludeBookingId);
  };
  
  const addBookingImpl = (bookingData: Omit<BookingSlot, 'id'>) => {
    // Validate that the booking is not in the past
    const startTime = new Date(bookingData.startTime);
    if (isPast(startTime)) {
      console.error("Cannot book shows in the past");
      return null;
    }
    
    const newBooking = createBooking(state.bookings, bookingData);
    
    // Update state
    dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify([...state.bookings, newBooking]));
    
    return newBooking;
  };
  
  const approveBookingImpl = (bookingId: string) => {
    dispatch({ type: 'APPROVE_BOOKING', payload: bookingId });
    
    const updatedBookings = state.bookings.map(booking => 
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
    
    const updatedBookings = state.bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: false, 
        rejected: true,
        rejectionReason: reason 
      } : booking
    );
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };
  
  const cancelBookingImpl = (bookingId: string) => {
    dispatch({ type: 'DELETE_BOOKING', payload: bookingId });
    
    const updatedBookings = state.bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been canceled`);
  };
  
  const updateBookingImpl = (bookingId: string, updatedBookingData: Partial<BookingSlot>) => {
    // Check if updating times and if they're in the past
    if (updatedBookingData.startTime) {
      const startTime = new Date(updatedBookingData.startTime);
      if (isPast(startTime)) {
        console.error("Cannot update to a time in the past");
        return null;
      }
    }
    
    if (!canUpdateBooking(state.bookings, bookingId, updatedBookingData)) {
      return null;
    }
    
    const bookingIndex = state.bookings.findIndex(booking => booking.id === bookingId);
    const updatedBooking = { ...state.bookings[bookingIndex], ...updatedBookingData };
    
    dispatch({ type: 'UPDATE_BOOKING', payload: updatedBooking });
    
    const updatedBookings = state.bookings.map((booking, index) => {
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
    getBookingsForStation: getBookingsForStationImpl,
    getBookingsForToday: getBookingsForTodayImpl,
    hasBookingConflict: hasBookingConflictImpl,
    addBooking: addBookingImpl,
    approveBooking: approveBookingImpl,
    rejectBooking: rejectBookingImpl,
    cancelBooking: cancelBookingImpl,
    updateBooking: updateBookingImpl
  };
};
