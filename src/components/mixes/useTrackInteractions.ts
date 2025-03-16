
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { Comment } from '@/models/Track';

/**
 * Custom hook that provides track interaction functionality including:
 * - Play/pause tracks
 * - Like tracks
 * - Share tracks
 * - Edit/delete tracks (with permission checks)
 * - Comment on tracks
 * - Upload new tracks
 * - Manage genres
 */
export const useTrackInteractions = () => {
  // Authentication and user information
  const { isAuthenticated, user } = useAuth();
  
  // Track context for track operations
  const { 
    tracks, 
    genres, 
    currentPlayingTrack, 
    setCurrentPlayingTrack, 
    likeTrack, 
    addComment,
    shareTrack,
    deleteTrack,
    canEditTrack
  } = useTrack();
  
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for managing comment inputs across multiple tracks
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  /**
   * Handles track upload navigation with permission checks
   * Only radio hosts can upload mixes
   */
  const handleUpload = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload mixes",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts can upload mixes",
        variant: "destructive"
      });
      return;
    }

    navigate('/upload-track');
  };

  /**
   * Handles genre management navigation with permission checks
   * Only radio hosts and admins can manage genres
   */
  const handleManageGenres = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to manage genres",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts and admins can manage genres",
        variant: "destructive"
      });
      return;
    }

    navigate('/manage-genres');
  };

  /**
   * Toggles play state for a track
   * @param trackId - ID of the track to play/pause
   */
  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId === currentPlayingTrack ? null : trackId);
  };

  /**
   * Handles liking a track
   * @param trackId - ID of the track to like
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeTrack(trackId);
  };

  /**
   * Handles sharing a track
   * @param trackId - ID of the track to share
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  /**
   * Navigates to edit track page
   * @param trackId - ID of the track to edit
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleEditTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-track/${trackId}`);
  };

  /**
   * Handles track deletion
   * @param trackId - ID of the track to delete
   */
  const handleDeleteTrack = (trackId: string) => {
    deleteTrack(trackId);
  };

  /**
   * Updates the comment text for a specific track
   * @param trackId - ID of the track being commented on
   * @param value - Comment text content
   */
  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments({
      ...newComments,
      [trackId]: value
    });
  };

  /**
   * Handles comment submission with authentication check
   * @param trackId - ID of the track to comment on
   * @param e - Form submission event
   */
  const handleSubmitComment = (trackId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to comment",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const commentText = newComments[trackId];
    if (!commentText?.trim()) return;

    addComment(trackId, {
      userId: user?.id || 'anonymous',
      username: user?.username || 'Anonymous',
      text: commentText
    });
    
    // Clear the comment input after submission
    setNewComments({
      ...newComments,
      [trackId]: ''
    });
  };

  /**
   * Checks if the current user can edit a specific track
   * @param trackId - ID of the track to check permissions for
   * @returns Boolean indicating whether user can edit the track
   */
  const canUserEditTrack = (trackId: string): boolean => {
    return canEditTrack(trackId);
  };

  return {
    isAuthenticated,
    user,
    currentPlayingTrack,
    newComments,
    handleUpload,
    handleManageGenres,
    handlePlayTrack,
    handleLikeTrack,
    handleShareTrack,
    handleEditTrack,
    handleDeleteTrack,
    handleCommentChange,
    handleSubmitComment,
    canUserEditTrack
  };
};
