
import { useTrack } from '@/hooks/useTrackContext';

/**
 * Custom hook for track playback functionality
 * Provides a handler for playing/pausing tracks
 */
export const useTrackPlayback = () => {
  const { currentPlayingTrack, setCurrentPlayingTrack } = useTrack();

  /**
   * Toggles play state for a track
   * @param trackId - ID of the track to play/pause
   */
  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId === currentPlayingTrack ? null : trackId);
  };

  return {
    currentPlayingTrack,
    handlePlayTrack
  };
};
