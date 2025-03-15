
import React, { useState } from 'react';
import { Calendar, Trash2, AlertCircle } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, isPast } from 'date-fns';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import PendingBookings from './PendingBookings';
import { BookingSlot } from '@/models/RadioStation';

const ShowBookings: React.FC = () => {
  const { bookings, stations, approveBooking, rejectBooking, cancelBooking } = useRadio();
  const { toast } = useToast();
  
  const [rejectionReason, setRejectionReason] = useState('');
  const [bookingToReject, setBookingToReject] = useState<string | null>(null);
  const [isRejectionDialogOpen, setIsRejectionDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const pendingBookings = bookings.filter(b => !b.approved && !b.rejected);
  const approvedBookings = bookings.filter(b => b.approved);
  const rejectedBookings = bookings.filter(b => b.rejected);
  const pastBookings = bookings.filter(b => isPast(new Date(b.endTime)));
  
  const upcomingBookings = approvedBookings.filter(b => !isPast(new Date(b.startTime)));
  
  // Get station name from ID
  const getStationName = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'Unknown Station';
  };
  
  // Handle booking approval
  const handleApproveBooking = (bookingId: string) => {
    approveBooking(bookingId);
    toast({
      title: "Booking approved",
      description: "Show has been added to the schedule"
    });
  };
  
  // Open rejection dialog
  const openRejectionDialog = (bookingId: string) => {
    setBookingToReject(bookingId);
    setRejectionReason('');
    setIsRejectionDialogOpen(true);
  };
  
  // Handle booking rejection
  const handleRejectBooking = () => {
    if (!bookingToReject) return;
    
    rejectBooking(bookingToReject, rejectionReason || 'Rejected by admin');
    setIsRejectionDialogOpen(false);
    setBookingToReject(null);
    
    toast({
      title: "Booking rejected",
      description: "The show request has been rejected"
    });
  };
  
  // Open delete dialog
  const openDeleteDialog = (bookingId: string) => {
    setBookingToDelete(bookingId);
    setIsDeleteDialogOpen(true);
  };
  
  // Handle booking deletion
  const handleDeleteBooking = () => {
    if (!bookingToDelete) return;
    
    cancelBooking(bookingToDelete);
    setIsDeleteDialogOpen(false);
    setBookingToDelete(null);
    
    toast({
      title: "Booking deleted",
      description: "The booking has been removed from the system"
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Calendar className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Show Bookings</h2>
      </div>
      
      <PendingBookings 
        pendingBookings={pendingBookings}
        getStationName={getStationName}
        onApprove={handleApproveBooking}
        onReject={openRejectionDialog}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>All Show Bookings</CardTitle>
          <CardDescription>
            Manage approved, rejected, and past show bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upcoming">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming Shows</TabsTrigger>
              <TabsTrigger value="past">Past Shows</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            
            {/* Upcoming Shows Tab */}
            <TabsContent value="upcoming">
              {upcomingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No upcoming shows scheduled.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Show Title</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingBookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell>{getStationName(booking.stationId)}</TableCell>
                          <TableCell>{booking.hostName}</TableCell>
                          <TableCell>{booking.title}</TableCell>
                          <TableCell>
                            {format(new Date(booking.startTime), 'MMM d, yyyy - h:mm a')} to {format(new Date(booking.endTime), 'h:mm a')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(booking.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            {/* Past Shows Tab */}
            <TabsContent value="past">
              {pastBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No past shows found.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Show Title</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastBookings.map(booking => (
                        <TableRow key={booking.id} className="text-muted-foreground">
                          <TableCell>{getStationName(booking.stationId)}</TableCell>
                          <TableCell>{booking.hostName}</TableCell>
                          <TableCell>{booking.title}</TableCell>
                          <TableCell>
                            {format(new Date(booking.startTime), 'MMM d, yyyy - h:mm a')} to {format(new Date(booking.endTime), 'h:mm a')}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(booking.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            
            {/* Rejected Shows Tab */}
            <TabsContent value="rejected">
              {rejectedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No rejected show requests.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Station</TableHead>
                        <TableHead>Host</TableHead>
                        <TableHead>Show Title</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedBookings.map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell>{getStationName(booking.stationId)}</TableCell>
                          <TableCell>{booking.hostName}</TableCell>
                          <TableCell>{booking.title}</TableCell>
                          <TableCell>
                            {format(new Date(booking.startTime), 'MMM d, yyyy - h:mm a')} to {format(new Date(booking.endTime), 'h:mm a')}
                          </TableCell>
                          <TableCell className="text-red-500">
                            {booking.rejectionReason || "No reason provided"}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => openDeleteDialog(booking.id)}
                              className="h-8 w-8 text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Rejection Dialog */}
      <Dialog open={isRejectionDialogOpen} onOpenChange={setIsRejectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Show Booking</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this show booking request.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4">
            <Input
              placeholder="Reason for rejection"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleRejectBooking}>
              Reject Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Dialog */}
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
            <Button variant="destructive" onClick={handleDeleteBooking}>
              Delete Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShowBookings;
