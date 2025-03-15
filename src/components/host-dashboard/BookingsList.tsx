
import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookingSlot } from '@/models/RadioStation';

interface BookingsListProps {
  approvedBookings: BookingSlot[];
  pendingBookings: BookingSlot[];
  rejectedBookings: BookingSlot[];
  getStationName: (stationId: string) => string;
  formatDate: (dateStr: string | Date) => string;
}

const BookingsList: React.FC<BookingsListProps> = ({ 
  approvedBookings, 
  pendingBookings, 
  rejectedBookings, 
  getStationName, 
  formatDate 
}) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Show Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming">
          <TabsList className="mb-4">
            <TabsTrigger value="upcoming">Upcoming ({approvedBookings.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {approvedBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">You don't have any upcoming shows</p>
                <Button 
                  className="mt-4" 
                  onClick={() => navigate('/stations')}
                >
                  Book a Show
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Show Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>{getStationName(booking.stationId)}</TableCell>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/stations/${booking.stationId}`)}
                        >
                          Go Live
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="pending">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any pending booking requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Show Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>{getStationName(booking.stationId)}</TableCell>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                      <TableCell>
                        <span className="text-yellow-500">Pending Approval</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="rejected">
            {rejectedBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any rejected booking requests</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Station</TableHead>
                    <TableHead>Show Title</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Rejection Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rejectedBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>{getStationName(booking.stationId)}</TableCell>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                      <TableCell className="text-red-500">
                        {booking.rejectionReason || "No reason provided"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BookingsList;
