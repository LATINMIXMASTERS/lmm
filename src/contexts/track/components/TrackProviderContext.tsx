
import React from 'react';
import { Track, Genre } from '@/models/Track';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createTrackActions } from '@/contexts/track/actions';
import { getTracksByGenre, getTracksByUser, getGenreById, canEditTrack, generateWaveformData } from '@/utils/trackUtils';

interface TrackProviderContextProps {
  state: {
    tracks: Track[];
    genres: Genre[];
    currentPlayingTrack: string | null;
  };
  dispatch: React.Dispatch<any>;
  setCurrentPlayingStation: (stationId: string | null) => void;
}

/**
 * Component that prepares the context value for TrackProvider
 * This extracts the complex context value creation logic from the main provider
 */
const TrackProviderContext: React.FC<TrackProviderContextProps> = ({
  state,
  dispatch,
  setCurrentPlayingStation
}) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // Create track action functions from our refactored modules
  const trackActions = createTrackActions(
    state,
    dispatch,
    user,
    toast,
    setCurrentPlayingStation
  );

  // The actual context value
  const contextValue = {
    tracks: state.tracks,
    genres: state.genres,
    addTrack: trackActions.addTrack,
    deleteTrack: trackActions.deleteTrack,
    updateTrack: trackActions.updateTrack,
    addGenre: trackActions.addGenre,
    getTracksByGenre: (genreId: string) => getTracksByGenre(state.tracks, state.genres, genreId),
    getTracksByUser: (userId: string) => getTracksByUser(state.tracks, userId),
    likeTrack: trackActions.likeTrack,
    addComment: trackActions.addComment,
    getGenreById: (id: string) => getGenreById(state.genres, id),
    currentPlayingTrack: state.currentPlayingTrack,
    setCurrentPlayingTrack: trackActions.setCurrentPlayingTrack,
    generateWaveformData,
    shareTrack: trackActions.shareTrack,
    canEditTrack: (trackId: string) => canEditTrack(state.tracks, user?.id, user?.isAdmin || false, trackId)
  };

  return contextValue;
};

export default TrackProviderContext;
