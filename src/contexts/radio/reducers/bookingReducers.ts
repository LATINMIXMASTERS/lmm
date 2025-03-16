
import { RadioState } from '../types';
import { RadioAction } from '../radioActionTypes';
import { bookingsReducers } from './bookings';

// Reducers for booking-related actions
export const bookingReducers = {
  setBookings: (state: RadioState, action: Extract<RadioAction, { type: 'SET_BOOKINGS' }>): RadioState => {
    return bookingsReducers.setBookings(state, action);
  },
  
  addBooking: (state: RadioState, action: Extract<RadioAction, { type: 'ADD_BOOKING' }>): RadioState => {
    return bookingsReducers.addBooking(state, action);
  },
  
  updateBooking: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_BOOKING' }>): RadioState => {
    return bookingsReducers.updateBooking(state, action);
  },
  
  deleteBooking: (state: RadioState, action: Extract<RadioAction, { type: 'DELETE_BOOKING' }>): RadioState => {
    return bookingsReducers.deleteBooking(state, action);
  },
  
  approveBooking: (state: RadioState, action: Extract<RadioAction, { type: 'APPROVE_BOOKING' }>): RadioState => {
    return bookingsReducers.approveBooking(state, action);
  },
  
  rejectBooking: (state: RadioState, action: Extract<RadioAction, { type: 'REJECT_BOOKING' }>): RadioState => {
    return bookingsReducers.rejectBooking(state, action);
  }
};
