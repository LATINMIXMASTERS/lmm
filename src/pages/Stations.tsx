
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Radio, Music } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import StationCard from '@/components/StationCard';
import { cn } from '@/lib/utils';
import { useRadio } from '@/contexts/RadioContext';

// Sample genres for filter
const genres = [
  'All',
  'Latin',
  'Bachata',
  'Reggaeton',
  'Salsa',
  'Electronic',
  'Urban',
  'Mix'
];

const Stations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredStations, setFilteredStations] = useState<any[]>([]);
  const [isAnimated, setIsAnimated] = useState(false);
  const { stations, setCurrentPlayingStation } = useRadio();
  
  // Get the initial genre from URL parameters
  useEffect(() => {
    const genreParam = searchParams.get('genre');
    if (genreParam) {
      // Capitalize first letter for display
      const formattedGenre = genreParam.charAt(0).toUpperCase() + genreParam.slice(1);
      if (genres.includes(formattedGenre)) {
        setSelectedGenre(formattedGenre);
      }
    }
    
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams]);
  
  const filterStations = useCallback(() => {
    let result = [...stations]; // Create a copy of stations
    
    // Filter by genre (unless "All" is selected)
    if (selectedGenre !== 'All') {
      result = result.filter(station => 
        station.genre.toLowerCase().includes(selectedGenre.toLowerCase())
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(station => 
        station.name.toLowerCase().includes(lowerQuery) || 
        station.genre.toLowerCase().includes(lowerQuery)
      );
    }
    
    setFilteredStations(result);
  }, [selectedGenre, searchQuery, stations]);
  
  // Update filters when search or genre changes
  useEffect(() => {
    filterStations();
  }, [filterStations]);
  
  const handleGenreChange = (genre: string) => {
    setSelectedGenre(genre);
    
    // Update URL params for genre (except "All")
    if (genre === 'All') {
      searchParams.delete('genre');
    } else {
      searchParams.set('genre', genre.toLowerCase());
    }
    setSearchParams(searchParams);
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const handlePlayToggle = (stationId: string) => {
    setCurrentlyPlayingId(currentlyPlayingId === stationId ? null : stationId);
    setCurrentPlayingStation(currentlyPlayingId === stationId ? null : stationId);
  };

  // For debugging
  console.log("Available stations:", stations);
  console.log("Filtered stations:", filteredStations);

  return (
    <MainLayout>
      <div className="mb-12 max-w-5xl mx-auto text-center">
        <div 
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full bg-blue/10 text-blue text-xs font-medium mb-4",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
        >
          <Radio className="w-3 h-3 mr-1" />
          {filteredStations.length} stations available
        </div>
        <h1 
          className={cn(
            "text-4xl md:text-5xl font-bold mb-4",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.1s" }}
        >
          LATINMIXMASTERS Radio Stations
        </h1>
        <p 
          className={cn(
            "text-gray-dark text-lg max-w-2xl mx-auto",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          Discover and stream Latin radio stations from around the world with crystal-clear audio quality.
        </p>
      </div>

      <div className="mb-10">
        <div 
          className={cn(
            "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.3s" }}
        >
          {/* Search input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray" size={18} />
            <input
              type="text"
              placeholder="Search stations..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-light focus:border-blue focus:ring-2 focus:ring-blue/30 outline-none transition-all duration-300"
            />
          </div>
          
          {/* Filter button - for mobile */}
          <div className="md:hidden w-full">
            <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-light rounded-lg">
              <Filter size={18} />
              Filter by genre
            </button>
          </div>
        </div>
        
        {/* Genre filters */}
        <div 
          className={cn(
            "hidden md:flex flex-wrap gap-2 mb-6",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.4s" }}
        >
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => handleGenreChange(genre)}
              className={cn(
                "px-4 py-2 rounded-full text-sm transition-all duration-300",
                selectedGenre === genre 
                  ? "bg-blue text-white" 
                  : "bg-gray-lightest text-gray-dark hover:bg-gray-light"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filteredStations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {filteredStations.map((station, index) => (
            <StationCard
              key={station.id}
              station={station}
              isPlaying={currentlyPlayingId === station.id}
              onPlayToggle={handlePlayToggle}
              className={cn(
                !isAnimated ? "opacity-0" : "animate-scale-in"
              )}
              style={{ animationDelay: `${index * 0.05 + 0.5}s` }}
            />
          ))}
        </div>
      ) : (
        <div 
          className={cn(
            "text-center py-16",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-lightest flex items-center justify-center">
            <Music className="text-gray" size={24} />
          </div>
          <h3 className="text-xl font-medium mb-2">No stations found</h3>
          <p className="text-gray-dark">Try adjusting your search or filters to find stations.</p>
        </div>
      )}
    </MainLayout>
  );
};

export default Stations;
