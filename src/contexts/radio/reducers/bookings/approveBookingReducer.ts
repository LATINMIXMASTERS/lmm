
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const approveBookingReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'APPROVE_BOOKING' }>
): RadioState => {
  return {
    ...state,
    bookings: state.bookings.map(booking => 
      booking.id === action.payload 
        ? { ...booking, approved: true, rejected: false, rejectionReason: undefined } 
        : booking
    )
  };
};
