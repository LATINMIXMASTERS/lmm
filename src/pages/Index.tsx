import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Radio, Calendar, ArrowRight } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { stations, currentPlayingStation, setCurrentPlayingStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [featuredStations, setFeaturedStations] = useState(stations.slice(0, 3));
  const [upcomingEvents, setUpcomingEvents] = useState([
    {
      id: '1',
      title: 'Salsa Night',
      date: '2024-08-15',
      time: '21:00',
      location: 'Club Havana'
    },
    {
      id: '2',
      title: 'Bachata Social',
      date: '2024-08-22',
      time: '20:00',
      location: 'Dance Studio 5'
    }
  ]);

  useEffect(() => {
    if (stations.length > 0) {
      setFeaturedStations(stations.slice(0, 3));
    }
  }, [stations]);

  const handleStationClick = (stationId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to listen to radio stations",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    setCurrentPlayingStation(stationId);
    toast({
      title: "Now Playing",
      description: `Started playing radio station`
    });
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Hero Section */}
        <section className="mb-8 md:mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Welcome to Latin Mix Masters
              </h1>
              <p className="text-gray-600 mb-6">
                Your ultimate destination for the best Latin music mixes and live radio stations.
                Explore our curated content and join the community!
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/mixes')}
                  className="bg-blue hover:bg-blue-dark text-white font-bold py-3 px-6 rounded"
                >
                  Explore Mixes
                </button>
                <button
                  onClick={() => navigate('/stations')}
                  className="bg-transparent hover:bg-gray-100 text-blue font-bold py-3 px-6 rounded border border-blue"
                >
                  Listen to Radio
                </button>
              </div>
            </div>
            <div>
              <img
                src="https://images.unsplash.com/photo-1541419403037-548046a244c4?q=80&w=2070&auto=format&fit=crop"
                alt="Music Vibe"
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
        </section>

        {/* Featured Mixes Section */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl font-bold mb-4">Featured Mixes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example Mix Card */}
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"
                alt="Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Salsa Night Fever</h3>
                <p className="text-gray-600 text-sm">DJ Carlos spins the hottest salsa tracks.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded block w-full text-center"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
            {/* Add more mix cards here */}
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"
                alt="Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Salsa Night Fever</h3>
                <p className="text-gray-600 text-sm">DJ Carlos spins the hottest salsa tracks.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded block w-full text-center"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
            <div className="rounded-lg overflow-hidden shadow-md">
              <img
                src="https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"
                alt="Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="font-bold text-lg mb-2">Salsa Night Fever</h3>
                <p className="text-gray-600 text-sm">DJ Carlos spins the hottest salsa tracks.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded block w-full text-center"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Radio Stations Section */}
        <section className="mb-8 md:mb-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Live Radio Stations</h2>
            <button
              onClick={() => navigate('/stations')}
              className="text-blue hover:underline flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStations.map(station => (
              <div
                key={station.id}
                className="rounded-lg overflow-hidden shadow-md cursor-pointer"
                onClick={() => handleStationClick(station.id)}
              >
                <img
                  src={station.image}
                  alt={station.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                  <p className="text-gray-600 text-sm">{station.genre}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
              <div key={event.id} className="rounded-lg overflow-hidden shadow-md">
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm">
                    {formatDate(event.date)} - {event.time} at {event.location}
                  </p>
                  <button
                    onClick={() => navigate('/book-show')}
                    className="mt-4 bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded block w-full text-center"
                  >
                    <Calendar className="inline-block w-4 h-4 mr-2" />
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
