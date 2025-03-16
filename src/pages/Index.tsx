
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Music, Radio, Calendar, ArrowRight } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';
import Hero from '@/components/Hero';

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
      {/* Hero Banner */}
      <Hero />
      
      <div className="container py-8 md:py-12 -mt-6 relative z-10 bg-white">
        {/* Featured Mixes Section */}
        <section className="mb-12 md:mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Featured Latin Mixes</h2>
            <button
              onClick={() => navigate('/mixes')}
              className="text-gold hover:underline flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Salsa Mix */}
            <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"
                alt="Salsa Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="inline-block px-2 py-1 bg-red-600 text-white text-xs rounded mb-2">Salsa</div>
                <h3 className="font-bold text-lg mb-2">Salsa Classics Remix</h3>
                <p className="text-gray-600 text-sm">A journey through timeless salsa hits reimagined.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
            
            {/* Bachata Mix */}
            <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1541419403037-548046a244c4?q=80&w=2070&auto=format&fit=crop"
                alt="Bachata Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded mb-2">Bachata</div>
                <h3 className="font-bold text-lg mb-2">Bachata Sensual</h3>
                <p className="text-gray-600 text-sm">Modern bachata tracks perfect for dancing the night away.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
            
            {/* Reggaeton Mix */}
            <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img
                src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop"
                alt="Reggaeton Mix Cover"
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded mb-2">Reggaeton</div>
                <h3 className="font-bold text-lg mb-2">Reggaeton Hits 2024</h3>
                <p className="text-gray-600 text-sm">The hottest reggaeton tracks making waves this year.</p>
                <button
                  onClick={() => navigate('/mixes')}
                  className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
                >
                  <Music className="inline-block w-4 h-4 mr-2" />
                  Listen Now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Live Radio Stations Section */}
        <section className="mb-12 md:mb-16">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Live Latin Radio</h2>
            <button
              onClick={() => navigate('/stations')}
              className="text-gold hover:underline flex items-center"
            >
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredStations.map(station => (
              <div
                key={station.id}
                className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleStationClick(station.id)}
              >
                <img
                  src={station.image}
                  alt={station.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <div className="inline-block px-2 py-1 bg-gold text-black text-xs rounded mb-2">{station.genre}</div>
                  <h3 className="font-bold text-lg mb-2">{station.name}</h3>
                  <p className="text-gray-600 text-sm">{station.description || 'Live Latin music 24/7'}</p>
                  <button className="mt-4 bg-red hover:bg-red-dark text-white font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300">
                    <Radio className="inline-block w-4 h-4 mr-2" />
                    Listen Live
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Events Section */}
        <section className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Upcoming Latin Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {upcomingEvents.map(event => (
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
        
        {/* About/Join Section */}
        <section className="bg-gray-50 rounded-xl p-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Join the LATINMIXMASTERS Community</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            LATINMIXMASTERS is an international DJ crew dedicated to bringing you the best Latin music
            from around the world. Join our community to discover new music, connect with other Latin music
            lovers, and stay updated on the latest events.
          </p>
          <button
            onClick={() => isAuthenticated ? navigate('/profile') : navigate('/login')}
            className="bg-red hover:bg-red-dark text-white font-bold py-3 px-8 rounded-full text-center transition-colors duration-300"
          >
            {isAuthenticated ? 'Go to Profile' : 'Sign Up Now'}
          </button>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
