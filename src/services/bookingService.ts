import { BookingSlot } from '@/models/RadioStation';
import { hasBookingConflict } from '@/utils/radioUtils';

// Generate a unique ID for bookings
const generateBookingId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Create a new booking
export const createBooking = (
  bookings: BookingSlot[],
  bookingData: Omit<BookingSlot, 'id'>
): BookingSlot => {
  const bookingId = generateBookingId();
  
  // Check for conflicts
  const hasConflict = hasBookingConflict(
    bookings,
    bookingData.stationId, 
    new Date(bookingData.startTime), 
    new Date(bookingData.endTime)
  );
  
  // Auto-approve if explicitly set to approved or no conflicts
  const autoApprove = bookingData.approved || !hasConflict;
  
  const newBooking: BookingSlot = {
    ...bookingData,
    id: bookingId,
    approved: autoApprove,
    rejected: hasConflict ? true : false,
    rejectionReason: hasConflict ? 'Conflicting time slot with an existing booking' : undefined
  };
  
  return newBooking;
};

// Check if booking can be updated (no conflicts)
export const canUpdateBooking = (
  bookings: BookingSlot[],
  bookingId: string, 
  updatedBookingData: Partial<BookingSlot>
): boolean => {
  const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
  
  if (bookingIndex === -1) {
    console.error(`Booking with ID ${bookingId} not found`);
    return false;
  }
  
  // If start or end time is being updated, check for conflicts
  if (updatedBookingData.startTime || updatedBookingData.endTime) {
    const booking = bookings[bookingIndex];
    const stationId = booking.stationId;
    const startTime = updatedBookingData.startTime 
      ? new Date(updatedBookingData.startTime) 
      : new Date(booking.startTime);
    const endTime = updatedBookingData.endTime 
      ? new Date(updatedBookingData.endTime) 
      : new Date(booking.endTime);
    
    const hasConflict = hasBookingConflict(bookings, stationId, startTime, endTime, bookingId);
    
    if (hasConflict) {
      console.error('Time slot conflict detected');
      return false;
    }
  }
  
  return true;
};
