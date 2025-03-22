
import { useAuth } from '@/contexts/AuthContext';
import {
  useTrackLikes,
  useTrackSharing,
  useTrackComments,
  useTrackPlayback,
  useTrackManagement,
  useGenreManagement,
  useTrackUpload
} from '@/hooks/track';

/**
 * Custom hook that provides track interaction functionality including:
 * - Play/pause tracks
 * - Like tracks
 * - Share tracks
 * - Edit/delete tracks (with permission checks)
 * - Comment on tracks
 * - Upload new tracks
 * - Manage genres
 * 
 * This hook composes multiple smaller, focused hooks to provide
 * a complete API for track interactions while keeping code maintainable.
 */
export const useTrackInteractions = () => {
  // Authentication and user information
  const { isAuthenticated, user } = useAuth();
  
  // Track interaction hooks
  const { handleLikeTrack, hasUserLikedTrack } = useTrackLikes();
  const { handleShareTrack, showSharingOptions } = useTrackSharing();
  const { newComments, handleCommentChange, handleSubmitComment } = useTrackComments();
  const { currentPlayingTrack, handlePlayTrack } = useTrackPlayback();
  const { handleEditTrack, handleDeleteTrack, canUserEditTrack } = useTrackManagement();
  const { handleManageGenres } = useGenreManagement();
  const { handleUpload } = useTrackUpload();

  return {
    // Authentication state
    isAuthenticated,
    user,
    
    // Track playback
    currentPlayingTrack,
    handlePlayTrack,
    
    // Track interactions
    handleLikeTrack,
    hasUserLikedTrack,
    handleShareTrack,
    showSharingOptions,
    
    // Comments
    newComments,
    handleCommentChange,
    handleSubmitComment,
    
    // Track management
    handleEditTrack,
    handleDeleteTrack,
    canUserEditTrack,
    
    // Navigation actions
    handleManageGenres,
    handleUpload
  };
};
