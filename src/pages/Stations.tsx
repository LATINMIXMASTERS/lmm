
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Radio, Music, Disc } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import StationCard from '@/components/StationCard';
import { cn } from '@/lib/utils';

// Sample stations data
const allStations = [
  {
    id: '1',
    name: 'House Electro Beats',
    genre: 'Electronic, House',
    image: 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?q=80&w=500&auto=format&fit=crop',
    listeners: 4271,
    isLive: true
  },
  {
    id: '2',
    name: 'Smooth Jazz',
    genre: 'Jazz, Blues',
    image: 'https://images.unsplash.com/photo-1415201364774-f6f0bb35f28f?q=80&w=500&auto=format&fit=crop',
    listeners: 2183
  },
  {
    id: '3',
    name: 'Classic Rock Anthems',
    genre: 'Rock, 70s, 80s',
    image: 'https://images.unsplash.com/photo-1461784180009-27c1303a64b6?q=80&w=500&auto=format&fit=crop',
    listeners: 3528
  },
  {
    id: '4',
    name: 'Hip-Hop Masters',
    genre: 'Hip-Hop, Rap',
    image: 'https://images.unsplash.com/photo-1546528377-65924449c301?q=80&w=500&auto=format&fit=crop',
    listeners: 5129,
    isLive: true
  },
  {
    id: '5',
    name: 'Pop Hits Radio',
    genre: 'Pop, Top 40',
    image: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?q=80&w=500&auto=format&fit=crop',
    listeners: 7543,
    isLive: true
  },
  {
    id: '6',
    name: 'Classical Symphony',
    genre: 'Classical',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=500&auto=format&fit=crop',
    listeners: 1245
  },
  {
    id: '7',
    name: 'Reggae Vibes',
    genre: 'Reggae, Dub',
    image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=500&auto=format&fit=crop',
    listeners: 2134
  },
  {
    id: '8',
    name: 'Country Roads',
    genre: 'Country, Folk',
    image: 'https://images.unsplash.com/photo-1543928069-2bc4bf3ebf64?q=80&w=500&auto=format&fit=crop',
    listeners: 3126
  },
  {
    id: '9',
    name: 'Indie Discoveries',
    genre: 'Indie, Alternative',
    image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?q=80&w=500&auto=format&fit=crop',
    listeners: 1876
  },
  {
    id: '10',
    name: 'Ambient Sounds',
    genre: 'Ambient, Chillout',
    image: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=500&auto=format&fit=crop',
    listeners: 923
  },
  {
    id: '11',
    name: 'Metal Mayhem',
    genre: 'Metal, Rock',
    image: 'https://images.unsplash.com/photo-1551886116-64f6d5a7f196?q=80&w=500&auto=format&fit=crop',
    listeners: 2874
  },
  {
    id: '12',
    name: 'Soul Sisters',
    genre: 'Soul, R&B',
    image: 'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=500&auto=format&fit=crop',
    listeners: 1523,
    isLive: true
  },
];

// Sample genres for filter
const genres = [
  'All',
  'Electronic',
  'Jazz',
  'Rock',
  'Hip-Hop',
  'Pop',
  'Classical',
  'Reggae',
  'Country',
  'Indie',
  'Ambient',
  'Metal',
  'Soul'
];

const Stations: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredStations, setFilteredStations] = useState(allStations);
  const [isAnimated, setIsAnimated] = useState(false);
  
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
    let result = allStations;
    
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
  }, [selectedGenre, searchQuery]);
  
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
  };

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
          Radio Stations
        </h1>
        <p 
          className={cn(
            "text-gray-dark text-lg max-w-2xl mx-auto",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          Discover and stream radio stations from around the world with crystal-clear audio quality.
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
      
      {filteredStations.length > 0 && (
        <div 
          className={cn(
            "text-center mb-16",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
          style={{ animationDelay: "0.8s" }}
        >
          <button className="px-6 py-3 border border-gray-light rounded-lg text-gray-dark hover:bg-gray-lightest transition-all duration-300">
            Load more stations
          </button>
        </div>
      )}
    </MainLayout>
  );
};

export default Stations;
