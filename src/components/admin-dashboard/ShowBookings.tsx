
import React from 'react';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ShowBookings: React.FC = () => {
  const { stations, bookings, approveBooking } = useRadio();
  
  const pendingBookings = bookings.filter(booking => !booking.approved);
  
  const handleApproveBooking = (bookingId: string) => {
    approveBooking(bookingId);
  };
  
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Approval</CardTitle>
          <CardDescription>
            Review and approve show booking requests from radio hosts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => {
                const station = stations.find(s => s.id === booking.stationId);
                return (
                  <div key={booking.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{booking.title}</h3>
                        <p className="text-sm text-gray-600 mb-1">
                          Host: {booking.hostName} • Station: {station?.name}
                        </p>
                        <p className="text-sm">
                          {format(new Date(booking.startTime), "MMMM d, yyyy - h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => handleApproveBooking(booking.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No pending booking requests at this time.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Approved Shows</CardTitle>
          <CardDescription>
            All upcoming approved radio shows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookings.filter(b => b.approved).length > 0 ? (
            <div className="space-y-3">
              {bookings
                .filter(b => b.approved)
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                .map((booking) => {
                  const station = stations.find(s => s.id === booking.stationId);
                  return (
                    <div key={booking.id} className="border border-green-200 bg-green-50 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{booking.title}</h3>
                          <p className="text-sm text-gray-600 mb-1">
                            Host: {booking.hostName} • Station: {station?.name}
                          </p>
                          <p className="text-sm">
                            {format(new Date(booking.startTime), "MMMM d, yyyy - h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                          </p>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No approved shows yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ShowBookings;
