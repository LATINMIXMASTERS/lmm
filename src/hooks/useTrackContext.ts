
import { useContext } from 'react';
import TrackContext from '@/contexts/TrackContext';

export const useTrackContext = () => {
  const context = useContext(TrackContext);
  if (context === undefined) {
    throw new Error('useTrackContext must be used within a TrackProvider');
  }
  return context;
};

export default useTrackContext;
