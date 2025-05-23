
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Search, Filter } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import StationCard from '@/components/StationCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import useRandomListeners from '@/hooks/useRandomListeners';

const Stations: React.FC = () => {
  const { stations, currentPlayingStation, setCurrentPlayingStation, setAudioState, audioState } = useRadio();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('All');
  
  // Use the hook to simulate random listener counts - called at top level
  useRandomListeners();

  const handleStationClick = (stationId: string, stationName: string) => {
    // Create a URL-friendly version of the station name
    const stationSlug = stationName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    navigate(`/stations/${stationSlug}`);
  };

  const handlePlayToggle = (stationId: string) => {
    if (currentPlayingStation === stationId) {
      // Toggle the playing state of the current station
      setAudioState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    } else {
      // Change to new station and ensure it's playing
      setCurrentPlayingStation(stationId);
      setAudioState(prev => ({ ...prev, isPlaying: true }));
    }
  };

  const filteredStations = stations.filter(station => {
    const searchMatch = station.name.toLowerCase().includes(searchTerm.toLowerCase());
    const genreMatch = filterGenre === 'All' || station.genre === filterGenre;
    return searchMatch && genreMatch;
  });

  const genres = ['All', ...new Set(stations.map(station => station.genre))];

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Radio Stations</h1>
            <p className="text-gray-600 mb-4 dark:text-gray-400">Listen to live radio from around the world</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Input
              type="text"
              placeholder="Search stations..."
              className="flex-1 min-w-[200px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="bg-white dark:bg-zinc-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue focus:border-blue-300 text-sm"
              value={filterGenre}
              onChange={(e) => setFilterGenre(e.target.value)}
            >
              {genres.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStations.map(station => (
            <StationCard
              key={station.id}
              station={station}
              isPlaying={currentPlayingStation === station.id && audioState.isPlaying}
              onPlayToggle={handlePlayToggle}
              onClick={() => handleStationClick(station.id, station.name)}
            />
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Stations;
