
import React, { useState } from 'react';
import { format, isPast } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Calendar, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookingSlot } from '@/models/RadioStation';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

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
  const navigate = useNavigate();
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
            {upcomingBookings.length === 0 ? (
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
                  {upcomingBookings.map(booking => (
                    <TableRow key={booking.id}>
                      <TableCell>{getStationName(booking.stationId)}</TableCell>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => navigate(`/stations/${booking.stationId}`)}
                          >
                            Go Live
                          </Button>
                          {onDeleteBooking && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(booking.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {pastBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">You don't have any past shows</p>
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
                  {pastBookings.map(booking => (
                    <TableRow key={booking.id} className="text-muted-foreground">
                      <TableCell>{getStationName(booking.stationId)}</TableCell>
                      <TableCell className="font-medium">{booking.title}</TableCell>
                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                      <TableCell>
                        {onDeleteBooking && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(booking.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        {onDeleteBooking && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(booking.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
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
                    <TableHead>Actions</TableHead>
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
                      <TableCell>
                        {onDeleteBooking && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(booking.id)}
                            className="h-8 w-8 text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default BookingsList;
