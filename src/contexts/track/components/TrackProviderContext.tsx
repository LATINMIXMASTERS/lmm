
import React from 'react';
import { Track, Genre } from '@/models/Track';
import { useTrackActions } from '@/contexts/track/hooks/useTrackActions';

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
  
  // Return the context value
  return {
    tracks: state.tracks,
    genres: state.genres,
    currentPlayingTrack: state.currentPlayingTrack,
    ...trackActions
  };
};

export default TrackProviderContext;
