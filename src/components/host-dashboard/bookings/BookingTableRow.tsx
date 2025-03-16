
import React from 'react';
import { format } from 'date-fns';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BookingSlot } from '@/models/RadioStation';

interface BookingTableRowProps {
  booking: BookingSlot;
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
  onDeleteBooking?: (bookingId: string) => void;
  isPast?: boolean;
  showStatus?: boolean;
  showRejectionReason?: boolean;
}

export const BookingTableRow: React.FC<BookingTableRowProps> = ({
  booking,
  getStationName,
  formatDate,
  onDeleteBooking,
  isPast = false,
  showStatus = false,
  showRejectionReason = false
}) => {
  const navigate = useNavigate();
  
  return (
    <TableRow key={booking.id} className={isPast ? "text-muted-foreground" : ""}>
      <TableCell>{getStationName(booking.stationId)}</TableCell>
      <TableCell className="font-medium">{booking.title}</TableCell>
      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
      
      {showStatus && (
        <TableCell>
          <span className="text-yellow-500">Pending Approval</span>
        </TableCell>
      )}
      
      {showRejectionReason && (
        <TableCell className="text-red-500">
          {booking.rejectionReason || "No reason provided"}
        </TableCell>
      )}
      
      <TableCell>
        <div className="flex gap-2">
          {!isPast && !showStatus && !showRejectionReason && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate(`/stations/${booking.stationId}`)}
            >
              Go Live
            </Button>
          )}
          
          {onDeleteBooking && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDeleteBooking(booking.id)}
              className="h-8 w-8 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
