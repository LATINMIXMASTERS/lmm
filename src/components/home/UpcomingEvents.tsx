
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Radio } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { BookingSlot } from '@/models/RadioStation';
import { format } from 'date-fns';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  stationId?: string;
}

const UpcomingEvents: React.FC = () => {
  const navigate = useNavigate();
  const { bookings, stations, getStationById } = useRadio();
  
  // Filter to only show approved upcoming bookings
  const upcomingBookings = bookings
    .filter(booking => 
      booking.approved && 
      new Date(booking.startTime) > new Date()
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 4); // Limit to 4 bookings
  
  if (upcomingBookings.length === 0) {
    return null;
  }
  
  const formatBookingTime = (booking: BookingSlot) => {
    return `${format(new Date(booking.startTime), 'h:mm a')} - ${format(new Date(booking.endTime), 'h:mm a')}`;
  };
  
  const getStationName = (stationId: string) => {
    const station = getStationById(stationId);
    return station ? station.name : 'Radio Station';
  };
  
  return (
    <section className="mb-8 md:mb-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Upcoming Radio Shows</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {upcomingBookings.map(booking => (
          <div key={booking.id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
            <div className="flex gap-4">
              <div className="text-center min-w-16">
                <div className="text-xl font-bold text-gold">
                  {format(new Date(booking.startTime), 'd')}
                </div>
                <div className="text-sm text-gray-600">
                  {format(new Date(booking.startTime), 'MMM')}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{booking.title}</h3>
                <p className="text-gray-600 text-sm mb-1">
                  Host: {booking.hostName}
                </p>
                <p className="text-gray-600 text-sm mb-3">
                  {formatBookingTime(booking)} at {getStationName(booking.stationId)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/book-show/${booking.stationId}`)}
                    className="bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full text-center transition-colors duration-300 text-sm"
                  >
                    <Calendar className="inline-block w-4 h-4 mr-1" />
                    Book Now
                  </button>
                  <button
                    onClick={() => navigate(`/stations/${booking.stationId}`)}
                    className="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded-full text-center transition-colors duration-300 text-sm"
                  >
                    <Radio className="inline-block w-4 h-4 mr-1" />
                    Visit Station
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
