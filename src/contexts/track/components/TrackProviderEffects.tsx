
import React, { useEffect } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { Track, Genre } from '@/models/Track';

interface TrackProviderEffectsProps {
  tracks: Track[];
  genres: Genre[];
  currentPlayingTrack: string | null;
  dispatch: React.Dispatch<any>;
  setCurrentPlayingStation: (stationId: string | null) => void;
}

/**
 * Component that handles all side effects for the TrackProvider
 * This keeps the main provider component cleaner and more focused
 */
const TrackProviderEffects: React.FC<TrackProviderEffectsProps> = ({
  tracks,
  genres,
  currentPlayingTrack,
  dispatch,
  setCurrentPlayingStation
}) => {
  // Initialize data from localStorage
  useEffect(() => {
    const savedTracks = localStorage.getItem('latinmixmasters_tracks');
    if (savedTracks) {
      dispatch({ type: 'SET_TRACKS', payload: JSON.parse(savedTracks) });
    }
    
    const savedGenres = localStorage.getItem('latinmixmasters_genres');
    if (savedGenres) {
      dispatch({ type: 'SET_GENRES', payload: JSON.parse(savedGenres) });
    } else {
      dispatch({ type: 'SET_GENRES', payload: initialGenres });
      localStorage.setItem('latinmixmasters_genres', JSON.stringify(initialGenres));
    }
  }, [dispatch]);

  // Stop playing station when a track starts
  useEffect(() => {
    if (currentPlayingTrack) {
      setCurrentPlayingStation(null);
    }
  }, [currentPlayingTrack, setCurrentPlayingStation]);

  return null; // This component doesn't render anything
};

// Import this here to avoid circular dependency
import { initialGenres } from '../trackReducer';

export default TrackProviderEffects;
