
import { BookingSlot } from '@/models/RadioStation';
import { getBookingsForStation, getBookingsForToday, hasBookingConflict } from '@/utils/radioUtils';

export const useGetBookingsActions = (bookings: BookingSlot[]) => {
  const getBookingsForStationImpl = (stationId: string) => 
    getBookingsForStation(bookings, stationId);
  
  const getBookingsForTodayImpl = (stationId: string) => 
    getBookingsForToday(bookings, stationId);
  
  const hasBookingConflictImpl = (
    stationId: string, 
    startTime: Date, 
    endTime: Date, 
    excludeBookingId?: string
  ) => {
    return hasBookingConflict(bookings, stationId, startTime, endTime, excludeBookingId);
  };

  return {
    getBookingsForStation: getBookingsForStationImpl,
    getBookingsForToday: getBookingsForTodayImpl,
    hasBookingConflict: hasBookingConflictImpl
  };
};
