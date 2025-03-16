
import { useState } from 'react';
import { isPast } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { BookingSlot } from '@/models/RadioStation';

export const useBookingsList = (
  approvedBookings: BookingSlot[],
  onDeleteBooking?: (bookingId: string) => void
) => {
  const { toast } = useToast();
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const upcomingBookings = approvedBookings.filter(booking => 
    !isPast(new Date(booking.startTime))
  );
  
  const pastBookings = approvedBookings.filter(booking => 
    isPast(new Date(booking.endTime))
  );

  const handleDeleteClick = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (bookingToDelete && onDeleteBooking) {
      onDeleteBooking(bookingToDelete);
      toast({
        title: "Booking deleted",
        description: "The booking has been removed"
      });
    }
    setIsDeleteDialogOpen(false);
    setBookingToDelete(null);
  };

  return {
    upcomingBookings,
    pastBookings,
    bookingToDelete,
    isDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete,
    setIsDeleteDialogOpen
  };
};
