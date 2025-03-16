
import { BookingSlot } from '@/models/RadioStation';
import { useGetBookingsActions } from './getBookingsActions';
import { useAddBookingAction } from './addBookingAction';
import { useApproveRejectBookingActions } from './approveRejectBookingActions';
import { useUpdateBookingAction } from './updateBookingAction';
import { useCancelBookingAction } from './cancelBookingAction';

export const useBookingActions = (
  state: { bookings: BookingSlot[] }, 
  dispatch: React.Dispatch<any>
) => {
  const getBookingsActions = useGetBookingsActions(state.bookings);
  const addBookingAction = useAddBookingAction(state.bookings, dispatch);
  const approveRejectActions = useApproveRejectBookingActions(state.bookings, dispatch);
  const updateBookingAction = useUpdateBookingAction(state.bookings, dispatch);
  const cancelBookingAction = useCancelBookingAction(state.bookings, dispatch);

  return {
    ...getBookingsActions,
    ...addBookingAction,
    ...approveRejectActions,
    ...updateBookingAction,
    ...cancelBookingAction,
  };
};
