
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
}

interface UpcomingEventsProps {
  events: Event[];
}

const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events }) => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-8 md:mb-12">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Upcoming Latin Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map(event => (
          <div key={event.id} className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100">
            <div className="flex gap-4">
              <div className="text-center min-w-16">
                <div className="text-xl font-bold text-gold">
                  {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric' })}
                </div>
                <div className="text-sm text-gray-600">
                  {new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-3">
                  {event.time} at {event.location}
                </p>
                <button
                  onClick={() => navigate('/book-show')}
                  className="bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full text-center transition-colors duration-300 text-sm"
                >
                  <Calendar className="inline-block w-4 h-4 mr-1" />
                  Book Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEvents;
