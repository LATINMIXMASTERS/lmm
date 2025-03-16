
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';
import Hero from '@/components/Hero';
import FeaturedMixes from '@/components/home/FeaturedMixes';
import LiveRadioSection from '@/components/home/LiveRadioSection';
import UpcomingEvents from '@/components/home/UpcomingEvents';
import CommunitySection from '@/components/home/CommunitySection';
import { Event } from '@/components/home/UpcomingEvents';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { stations, currentPlayingStation, setCurrentPlayingStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [featuredStations, setFeaturedStations] = useState(stations.slice(0, 3));
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([
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

  return (
    <MainLayout>
      {/* Hero Banner */}
      <Hero />
      
      <div className="container py-8 md:py-12 -mt-6 relative z-10 bg-white">
        {/* Featured Mixes Section */}
        <FeaturedMixes />

        {/* Live Radio Stations Section */}
        <LiveRadioSection 
          stations={featuredStations} 
          currentPlayingStation={currentPlayingStation} 
          onStationClick={handleStationClick} 
        />

        {/* Upcoming Events Section */}
        <UpcomingEvents events={upcomingEvents} />
        
        {/* About/Join Section */}
        <CommunitySection isAuthenticated={isAuthenticated} />
      </div>
    </MainLayout>
  );
};

export default Index;
