
import { useTrack } from '@/hooks/useTrackContext';

/**
 * Custom hook for track sharing functionality
 * Provides a handler for sharing tracks
 */
export const useTrackSharing = () => {
  const { shareTrack } = useTrack();

  /**
   * Handles sharing a track
   * @param trackId - ID of the track to share
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  return {
    handleShareTrack
  };
};
