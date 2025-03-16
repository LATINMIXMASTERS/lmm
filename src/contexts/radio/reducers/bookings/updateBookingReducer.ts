
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const updateBookingReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'UPDATE_BOOKING' }>
): RadioState => {
  return {
    ...state,
    bookings: state.bookings.map(booking => 
      booking.id === action.payload.id ? action.payload : booking
    )
  };
};
