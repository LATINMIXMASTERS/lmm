
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const addBookingReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'ADD_BOOKING' }>
): RadioState => {
  return {
    ...state,
    bookings: [...state.bookings, action.payload]
  };
};
