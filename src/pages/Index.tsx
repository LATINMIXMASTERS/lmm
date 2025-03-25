
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
import useRandomListeners from '@/hooks/useRandomListeners';

const Index: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { stations, currentPlayingStation, setCurrentPlayingStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [featuredStations, setFeaturedStations] = useState(stations.slice(0, 3));
  
  // Use the hook to simulate random listener counts
  useRandomListeners();

  useEffect(() => {
    if (stations.length > 0) {
      setFeaturedStations(stations.slice(0, 3));
    }
  }, [stations]);

  const handleStationClick = (stationId: string) => {
    setCurrentPlayingStation(stationId);
  };

  return (
    <MainLayout>
      {/* Hero Banner */}
      <Hero />
      
      <div className="container py-8 md:py-12 -mt-6 relative z-10 bg-background dark:bg-background">
        {/* Featured Mixes Section */}
        <FeaturedMixes />

        {/* Live Radio Stations Section */}
        <LiveRadioSection 
          stations={featuredStations} 
          currentPlayingStation={currentPlayingStation} 
          onStationClick={handleStationClick} 
        />

        {/* Upcoming Events Section */}
        <UpcomingEvents />
        
        {/* About/Join Section */}
        <CommunitySection isAuthenticated={isAuthenticated} />
      </div>
    </MainLayout>
  );
};

export default Index;
