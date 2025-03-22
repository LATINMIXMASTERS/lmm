
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

/**
 * Custom hook for track liking functionality
 * Provides a handler for liking tracks with authentication checks
 * and ensures users can only like a track once
 */
export const useTrackLikes = () => {
  const { isAuthenticated, user } = useAuth();
  const { likeTrack, tracks } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

  // Load liked tracks from localStorage on component mount
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const savedLikedTracks = localStorage.getItem(`latinmixmasters_liked_tracks_${user.id}`);
      if (savedLikedTracks) {
        setLikedTracks(JSON.parse(savedLikedTracks));
      }
    }
  }, [isAuthenticated, user?.id]);

  /**
   * Check if user has already liked a specific track
   * @param trackId - ID of the track to check
   */
  const hasUserLikedTrack = (trackId: string): boolean => {
    return !!likedTracks[trackId];
  };

  /**
   * Handles liking a track with authentication check
   * Prevents multiple likes from the same user
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

    // Check if user has already liked this track
    if (hasUserLikedTrack(trackId)) {
      toast({
        title: "Already Liked",
        description: "You have already liked this track",
      });
      return;
    }
    
    // Like the track and update localStorage
    likeTrack(trackId);
    
    // Update liked tracks state and localStorage
    if (user?.id) {
      const updatedLikedTracks = {
        ...likedTracks,
        [trackId]: true
      };
      setLikedTracks(updatedLikedTracks);
      localStorage.setItem(
        `latinmixmasters_liked_tracks_${user.id}`,
        JSON.stringify(updatedLikedTracks)
      );
    }
  };

  return {
    handleLikeTrack,
    hasUserLikedTrack
  };
};
