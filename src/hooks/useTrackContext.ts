
import { useContext } from 'react';
import TrackContext from '@/contexts/TrackContext';

export const useTrack = () => {
  const context = useContext(TrackContext);
  if (context === undefined) {
    throw new Error('useTrack must be used within a TrackProvider');
  }
  return context;
};

export const useTrackContext = useTrack; // Alias for backward compatibility
export default useTrack;
