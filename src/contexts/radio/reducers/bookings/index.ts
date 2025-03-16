
import { setBookingsReducer } from './setBookingsReducer';
import { addBookingReducer } from './addBookingReducer';
import { updateBookingReducer } from './updateBookingReducer';
import { deleteBookingReducer } from './deleteBookingReducer';
import { approveBookingReducer } from './approveBookingReducer';
import { rejectBookingReducer } from './rejectBookingReducer';

export const bookingsReducers = {
  setBookings: setBookingsReducer,
  addBooking: addBookingReducer,
  updateBooking: updateBookingReducer,
  deleteBooking: deleteBookingReducer,
  approveBooking: approveBookingReducer,
  rejectBooking: rejectBookingReducer
};
