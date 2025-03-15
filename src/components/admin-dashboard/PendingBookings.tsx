
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { BookingSlot } from '@/models/RadioStation';

interface PendingBookingsProps {
  pendingBookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  onApprove: (bookingId: string) => void;
  onReject: (bookingId: string) => void;
}

const PendingBookings: React.FC<PendingBookingsProps> = ({ 
  pendingBookings, 
  getStationName, 
  onApprove, 
  onReject 
}) => {
  if (pendingBookings.length === 0) {
    return null;
  }
  
  return (
    <Card className="mb-6 border-gold/20">
      <CardHeader>
        <CardTitle className="text-gold">Pending Show Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Host</TableHead>
                <TableHead>Show Title</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingBookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>{getStationName(booking.stationId)}</TableCell>
                  <TableCell>{booking.hostName}</TableCell>
                  <TableCell>{booking.title}</TableCell>
                  <TableCell>
                    {format(new Date(booking.startTime), 'MMM d, yyyy - h:mm a')} to {format(new Date(booking.endTime), 'h:mm a')}
                  </TableCell>
                  <TableCell className="flex justify-end gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onApprove(booking.id)}
                      className="text-green-500 border-green-500 hover:bg-green-500/10"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onReject(booking.id)}
                      className="text-red-500 border-red-500 hover:bg-red-500/10"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingBookings;
