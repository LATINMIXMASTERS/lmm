
import { BookingSlot } from '@/models/RadioStation';
import { useBookingActions as useModularBookingActions } from './bookings';

export const useBookingActions = (
  state: { bookings: BookingSlot[] }, 
  dispatch: React.Dispatch<any>
) => {
  return useModularBookingActions(state, dispatch);
};
