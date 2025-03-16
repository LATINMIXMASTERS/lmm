
import React from 'react';
import { Track, Genre } from '@/models/Track';
import { useTrackActions } from '@/contexts/track/hooks/useTrackActions';
import { canEditTrack, generateWaveformData } from '@/utils/trackUtils';

interface TrackProviderContextProps {
  state: {
    tracks: Track[];
    genres: Genre[];
    currentPlayingTrack: string | null;
  };
  dispatch: React.Dispatch<any>;
  setCurrentPlayingStation: (stationId: string | null) => void;
}

// This component doesn't render anything, it just returns the context value
const TrackProviderContext = ({ 
  state, 
  dispatch, 
  setCurrentPlayingStation 
}: TrackProviderContextProps) => {
  // Initialize all track actions
  const trackActions = useTrackActions(state, dispatch, setCurrentPlayingStation);
  
  // Add the missing functions required by TrackContextType
  const getTracksByGenre = (genreId: string) => {
    return state.tracks.filter(track => track.genre === genreId);
  };
  
  const getTracksByUser = (userId: string) => {
    return state.tracks.filter(track => track.uploadedBy === userId);
  };
  
  const getGenreById = (genreId: string) => {
    return state.genres.find(g => g.id === genreId);
  };
  
  // Adapt canEditTrack to match the expected signature
  const canEditTrackWrapper = (trackId: string) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return false;
    
    // We're assuming these values would come from context or props in the actual implementation
    const userId = trackActions.user?.id;
    const isAdmin = trackActions.user?.isAdmin || false;
    
    return canEditTrack(state.tracks, userId, isAdmin, trackId);
  };
  
  // Return the context value
  return {
    tracks: state.tracks,
    genres: state.genres,
    currentPlayingTrack: state.currentPlayingTrack,
    getTracksByGenre,
    getTracksByUser,
    getGenreById,
    generateWaveformData,
    canEditTrack: canEditTrackWrapper,
    ...trackActions
  };
};

export default TrackProviderContext;
