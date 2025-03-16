
import { RadioState } from '../types';
import { RadioAction } from '../radioActionTypes';

// Reducers for booking-related actions
export const bookingReducers = {
  setBookings: (state: RadioState, action: Extract<RadioAction, { type: 'SET_BOOKINGS' }>): RadioState => {
    return {
      ...state,
      bookings: action.payload
    };
  },
  
  addBooking: (state: RadioState, action: Extract<RadioAction, { type: 'ADD_BOOKING' }>): RadioState => {
    return {
      ...state,
      bookings: [...state.bookings, action.payload]
    };
  },
  
  updateBooking: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_BOOKING' }>): RadioState => {
    return {
      ...state,
      bookings: state.bookings.map(booking => 
        booking.id === action.payload.id ? action.payload : booking
      )
    };
  },
  
  deleteBooking: (state: RadioState, action: Extract<RadioAction, { type: 'DELETE_BOOKING' }>): RadioState => {
    return {
      ...state,
      bookings: state.bookings.filter(booking => booking.id !== action.payload)
    };
  },
  
  approveBooking: (state: RadioState, action: Extract<RadioAction, { type: 'APPROVE_BOOKING' }>): RadioState => {
    return {
      ...state,
      bookings: state.bookings.map(booking => 
        booking.id === action.payload 
          ? { ...booking, approved: true, rejected: false, rejectionReason: undefined } 
          : booking
      )
    };
  },
  
  rejectBooking: (state: RadioState, action: Extract<RadioAction, { type: 'REJECT_BOOKING' }>): RadioState => {
    return {
      ...state,
      bookings: state.bookings.map(booking => 
        booking.id === action.payload.bookingId 
          ? { ...booking, approved: false, rejected: true, rejectionReason: action.payload.reason } 
          : booking
      )
    };
  }
};
