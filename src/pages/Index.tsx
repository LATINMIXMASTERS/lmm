import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Radio, Headphones, Music } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import Hero from '@/components/Hero';
import StationCard from '@/components/StationCard';
import { cn } from '@/lib/utils';
import { useRadio } from '@/contexts/RadioContext';
import { useTrack } from '@/contexts/TrackContext';

const Index: React.FC = () => {
  const [animatedSections, setAnimatedSections] = useState<{ [key: string]: boolean }>({
    stations: false,
    genres: false,
    download: false
  });
  const { stations, currentPlayingStation, setCurrentPlayingStation } = useRadio();
  const { genres } = useTrack();

  useEffect(() => {
    const handleScroll = () => {
      const sections = {
        stations: document.getElementById('stations-section'),
        genres: document.getElementById('genres-section'),
        download: document.getElementById('download-section')
      };
      
      Object.entries(sections).forEach(([key, section]) => {
        if (!section) return;
        
        const rect = section.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.8;
        
        if (isVisible && !animatedSections[key]) {
          setAnimatedSections(prev => ({ ...prev, [key]: true }));
        }
      });
    };
    
    // Initial check
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [animatedSections]);

  const handlePlayToggle = (stationId: string) => {
    setCurrentPlayingStation(currentPlayingStation === stationId ? null : stationId);
  };

  // Filter out unavailable stations
  const availableStations = stations.filter(station => !!station.streamDetails?.url);

  return (
    <MainLayout>
      <Hero className="mx-auto -mt-16 mb-24" />
      
      {/* Available Stations */}
      <section 
        id="stations-section"
        className="mb-24"
      >
        <div 
          className={cn(
            "flex justify-between items-center mb-8",
            !animatedSections.stations ? "opacity-0" : "animate-slide-down"
          )}
        >
          <h2 className="text-3xl font-semibold">Available Stations</h2>
          <Link 
            to="/stations" 
            className="flex items-center text-blue hover:underline font-medium"
          >
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        {availableStations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {availableStations.slice(0, 4).map((station, index) => (
              <StationCard
                key={station.id}
                station={station}
                isPlaying={currentPlayingStation === station.id}
                onPlayToggle={handlePlayToggle}
                className={cn(
                  !animatedSections.stations ? "opacity-0" : "animate-scale-in",
                )}
                style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-100 rounded-lg">
            <p>No available stations found. Check back later!</p>
          </div>
        )}
      </section>

      {/* Mix Genres */}
      <section 
        id="genres-section"
        className="mb-24"
      >
        <div 
          className={cn(
            "flex justify-between items-center mb-8",
            !animatedSections.genres ? "opacity-0" : "animate-slide-down"
          )}
        >
          <h2 className="text-3xl font-semibold">Mix Genres</h2>
          <Link 
            to="/mixes" 
            className="flex items-center text-blue hover:underline font-medium"
          >
            View All Mixes <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {genres.map((genre, index) => (
            <Link
              to={`/mixes?genre=${genre.id}`}
              key={genre.id}
              className={cn(
                "flex flex-col items-center justify-center p-6 rounded-lg bg-white border border-gray-light",
                "hover:shadow-md hover:border-gray transition-all duration-300 hover:translate-y-[-4px]",
                !animatedSections.genres ? "opacity-0" : "animate-scale-in"
              )}
              style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
            >
              <div className="w-14 h-14 rounded-full bg-blue/10 text-blue flex items-center justify-center mb-4">
                <Music className="w-5 h-5" />
              </div>
              <h3 className="font-medium mb-1">{genre.name}</h3>
              <p className="text-sm text-gray">{genre.trackCount || 0} mixes</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Download App */}
      <section 
        id="download-section"
        className={cn(
          "bg-gradient-to-r from-blue-dark to-blue rounded-xl py-16 px-6 md:px-12 mb-24 overflow-hidden relative",
          !animatedSections.download ? "opacity-0" : "animate-fade-in"
        )}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Take Your Music Everywhere</h2>
              <p className="text-blue-50/90 mb-8">
                Download our mobile app to enjoy your favorite radio stations on the go. Available for iOS and Android.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white/10 hover:bg-white/20 border border-white/25 text-white py-3 px-6 rounded-lg backdrop-blur-sm transition-colors duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm-1 13.5v-7l5 3.5-5 3.5z" />
                  </svg>
                  Google Play
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/25 text-white py-3 px-6 rounded-lg backdrop-blur-sm transition-colors duration-300 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2">
                    <path d="M22 17.607c-.786 2.28-3.139 6.317-5.563 6.361-1.608.031-2.125-.953-3.963-.953-1.837 0-2.412.923-3.932.983-2.572.099-6.542-5.827-6.542-10.995 0-4.747 3.308-7.1 6.198-7.143 1.55-.028 3.014 1.045 3.959 1.045.949 0 2.727-1.29 4.596-1.101.782.033 2.979.315 4.389 2.377-3.741 2.442-3.158 7.549.858 9.426zm-5.222-17.607c-2.826.114-5.132 3.079-4.81 5.531 2.612.203 5.118-2.725 4.81-5.531z"/>
                  </svg>
                  App Store
                </button>
              </div>
            </div>
            <div className="hidden md:block relative">
              <div className="absolute -right-10 -top-10 bottom-0 w-80 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transform rotate-6 animate-float"></div>
              <div className="absolute -right-5 -bottom-5 top-10 w-80 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl transform -rotate-3 animate-float" style={{ animationDelay: "1s" }}></div>
              <div className="relative w-72 h-[500px] bg-black/40 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl overflow-hidden mx-auto">
                <div className="h-8 w-24 bg-black rounded-b-xl mx-auto"></div>
                <div className="mt-4 mx-3 rounded-lg overflow-hidden border border-white/10">
                  <img 
                    src="https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=500&auto=format&fit=crop" 
                    alt="App Interface" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="p-4">
                  <div className="h-5 w-32 bg-white/10 rounded-full mb-3"></div>
                  <div className="h-4 w-48 bg-white/10 rounded-full mb-6"></div>
                  <div className="h-12 w-full bg-blue rounded-full flex items-center justify-center my-3">
                    <div className="w-4 h-4 bg-white rounded-full ml-0.5"></div>
                  </div>
                  <div className="flex justify-between mt-6">
                    <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
                    <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
                    <div className="h-16 w-16 bg-white/10 rounded-lg"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/2 bg-gradient-to-tl from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute left-0 top-0 w-1/4 h-1/3 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
      </section>
    </MainLayout>
  );
};

export default Index;
