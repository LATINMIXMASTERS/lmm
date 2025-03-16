
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createTrackActions } from '@/contexts/track/actions';
import { Track, Genre } from '@/models/Track';

/**
 * Custom hook that provides all track-related actions by leveraging the createTrackActions factory
 * This hook connects the action creators with the necessary dependencies like auth and toast
 */
export const useTrackActions = (
  state: { tracks: Track[], genres: Genre[], currentPlayingTrack: string | null },
  dispatch: React.Dispatch<any>,
  setCurrentPlayingStation: (stationId: string | null) => void
) => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Call the action creators factory with all required dependencies
  const trackActions = createTrackActions(
    state,
    dispatch,
    user,
    toast,
    setCurrentPlayingStation
  );
  
  return trackActions;
};
