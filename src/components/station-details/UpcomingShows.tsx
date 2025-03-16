
import React from 'react';
import { Clock } from 'lucide-react';
import { BookingSlot } from '@/models/RadioStation';
import { isPast } from 'date-fns';

interface UpcomingShowsProps {
  bookings: BookingSlot[];
}

const UpcomingShows: React.FC<UpcomingShowsProps> = ({ bookings }) => {
  // Filter out past shows
  const upcomingBookings = bookings.filter(booking => 
    !isPast(new Date(booking.endTime))
  );
  
  if (upcomingBookings.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2">Upcoming Shows</h3>
      <div className="space-y-2">
        {upcomingBookings.map((booking) => (
          <div key={booking.id} className="p-3 bg-accent/30 rounded-md">
            <h4 className="font-medium">{booking.title}</h4>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Clock className="w-3 h-3 mr-1" />
              <span>
                {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                {' - '}
                {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            </div>
            <p className="text-xs mt-1">Host: {booking.hostName}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingShows;
