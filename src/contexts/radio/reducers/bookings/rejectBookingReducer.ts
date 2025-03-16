
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const rejectBookingReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'REJECT_BOOKING' }>
): RadioState => {
  return {
    ...state,
    bookings: state.bookings.map(booking => 
      booking.id === action.payload.bookingId 
        ? { ...booking, approved: false, rejected: true, rejectionReason: action.payload.reason } 
        : booking
    )
  };
};
