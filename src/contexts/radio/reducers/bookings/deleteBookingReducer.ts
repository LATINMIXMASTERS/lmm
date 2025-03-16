
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const deleteBookingReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'DELETE_BOOKING' }>
): RadioState => {
  return {
    ...state,
    bookings: state.bookings.filter(booking => booking.id !== action.payload)
  };
};
