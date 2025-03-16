
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for track liking functionality
 * Provides a handler for liking tracks with authentication checks
 */
export const useTrackLikes = () => {
  const { isAuthenticated } = useAuth();
  const { likeTrack } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Handles liking a track with authentication check
   * @param trackId - ID of the track to like
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to like tracks",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    likeTrack(trackId);
  };

  return {
    handleLikeTrack
  };
};
