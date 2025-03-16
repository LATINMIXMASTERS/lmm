
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody } from '@/components/ui/table';
import { BookingSlot } from '@/models/RadioStation';
import { BookingTableRow } from './BookingTableRow';

interface BookingsTableProps {
  bookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
  onDeleteBooking?: (bookingId: string) => void;
  isPast?: boolean;
  showStatus?: boolean;
  showRejectionReason?: boolean;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  getStationName,
  formatDate,
  onDeleteBooking,
  isPast = false,
  showStatus = false,
  showRejectionReason = false
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Station</TableHead>
          <TableHead>Show Title</TableHead>
          <TableHead>Date & Time</TableHead>
          {showStatus && <TableHead>Status</TableHead>}
          {showRejectionReason && <TableHead>Rejection Reason</TableHead>}
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map(booking => (
          <BookingTableRow
            key={booking.id}
            booking={booking}
            getStationName={getStationName}
            formatDate={formatDate}
            onDeleteBooking={onDeleteBooking}
            isPast={isPast}
            showStatus={showStatus}
            showRejectionReason={showRejectionReason}
          />
        ))}
      </TableBody>
    </Table>
  );
};
