
import React, { useReducer, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { trackReducer, initialTrackState, initialGenres } from '@/contexts/track/trackReducer';
import { createTrackActions } from '@/contexts/track/trackActions';
import TrackContext from '@/contexts/track/TrackContext';
import { generateWaveformData, getTracksByGenre, getTracksByUser, getGenreById, canEditTrack } from '@/utils/trackUtils';

export const TrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trackReducer, initialTrackState);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentPlayingStation } = useRadio();

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
  }, []);

  // Stop playing station when a track starts
  useEffect(() => {
    if (state.currentPlayingTrack) {
      setCurrentPlayingStation(null);
    }
  }, [state.currentPlayingTrack, setCurrentPlayingStation]);

  // Create track action functions
  const trackActions = createTrackActions(
    state,
    dispatch,
    user,
    toast,
    setCurrentPlayingStation
  );

  return (
    <TrackContext.Provider value={{
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
    }}>
      {children}
    </TrackContext.Provider>
  );
};

export default TrackProvider;
