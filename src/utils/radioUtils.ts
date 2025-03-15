
import { BookingSlot, RadioStation } from '@/models/RadioStation';
import { isAfter, isBefore } from 'date-fns';

// Helper to check for booking conflicts
export const hasBookingConflict = (
  bookings: BookingSlot[],
  stationId: string, 
  startTime: Date, 
  endTime: Date, 
  excludeBookingId?: string
) => {
  const stationBookings = bookings
    .filter(booking => booking.stationId === stationId && booking.id !== excludeBookingId && !booking.rejected);
  
  return stationBookings.some(booking => {
    const bookingStart = new Date(booking.startTime);
    const bookingEnd = new Date(booking.endTime);
    
    return (
      (isAfter(startTime, bookingStart) && isBefore(startTime, bookingEnd)) ||
      (isAfter(endTime, bookingStart) && isBefore(endTime, bookingEnd)) ||
      (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd)) ||
      (startTime.getTime() === bookingStart.getTime()) ||
      (endTime.getTime() === bookingEnd.getTime())
    );
  });
};

// Format stream URL to ensure it has proper protocol
export const formatStreamUrl = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

// Get bookings for a specific station
export const getBookingsForStation = (bookings: BookingSlot[], stationId: string): BookingSlot[] => {
  return bookings.filter(booking => booking.stationId === stationId);
};

// Get a station by its ID
export const getStationById = (stations: RadioStation[], id: string): RadioStation | undefined => {
  return stations.find(station => station.id === id);
};

// Get bookings for today
export const getBookingsForToday = (bookings: BookingSlot[], stationId: string): BookingSlot[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  
  return bookings.filter(booking => 
    booking.stationId === stationId && 
    isAfter(new Date(booking.startTime), today) &&
    isBefore(new Date(booking.startTime), tomorrow)
  );
};
