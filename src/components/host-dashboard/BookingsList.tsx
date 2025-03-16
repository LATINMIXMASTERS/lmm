
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingSlot } from '@/models/RadioStation';
import { DeleteBookingDialog } from './bookings/DeleteBookingDialog';
import { UpcomingBookingsList } from './bookings/UpcomingBookingsList';
import { PastBookingsList } from './bookings/PastBookingsList';
import { PendingBookingsList } from './bookings/PendingBookingsList';
import { RejectedBookingsList } from './bookings/RejectedBookingsList';
import { useBookingsList } from './bookings/useBookingsList';

interface BookingsListProps {
  approvedBookings: BookingSlot[];
  pendingBookings: BookingSlot[];
  rejectedBookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
  onDeleteBooking?: (bookingId: string) => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ 
  approvedBookings, 
  pendingBookings, 
  rejectedBookings, 
  getStationName, 
  formatDate,
  onDeleteBooking
}) => {
  const {
    upcomingBookings,
    pastBookings,
    bookingToDelete,
    isDeleteDialogOpen,
    handleDeleteClick,
    confirmDelete,
    setIsDeleteDialogOpen
  } = useBookingsList(approvedBookings, onDeleteBooking);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Show Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({upcomingBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past Shows ({pastBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <UpcomingBookingsList 
              bookings={upcomingBookings}
              getStationName={getStationName}
              formatDate={formatDate}
              onDeleteBooking={onDeleteBooking ? handleDeleteClick : undefined}
            />
          </TabsContent>
          
          <TabsContent value="past">
            <PastBookingsList
              bookings={pastBookings}
              getStationName={getStationName}
              formatDate={formatDate}
              onDeleteBooking={onDeleteBooking ? handleDeleteClick : undefined}
            />
          </TabsContent>
          
          <TabsContent value="pending">
            <PendingBookingsList
              bookings={pendingBookings}
              getStationName={getStationName}
              formatDate={formatDate}
              onDeleteBooking={onDeleteBooking ? handleDeleteClick : undefined}
            />
          </TabsContent>
          
          <TabsContent value="rejected">
            <RejectedBookingsList
              bookings={rejectedBookings}
              getStationName={getStationName}
              formatDate={formatDate}
              onDeleteBooking={onDeleteBooking ? handleDeleteClick : undefined}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <DeleteBookingDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </Card>
  );
};

export default BookingsList;
