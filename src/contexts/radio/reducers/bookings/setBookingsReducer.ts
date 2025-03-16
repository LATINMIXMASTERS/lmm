
import { RadioState } from '../../types';
import { RadioAction } from '../../radioActionTypes';

export const setBookingsReducer = (
  state: RadioState, 
  action: Extract<RadioAction, { type: 'SET_BOOKINGS' }>
): RadioState => {
  return {
    ...state,
    bookings: action.payload
  };
};
