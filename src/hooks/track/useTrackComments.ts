
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for track commenting functionality
 * Provides state and handlers for managing comments
 */
export const useTrackComments = () => {
  const { isAuthenticated, user } = useAuth();
  const { addComment } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State for managing comment inputs across multiple tracks
  const [newComments, setNewComments] = useState<Record<string, string>>({});

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

  return {
    newComments,
    handleCommentChange,
    handleSubmitComment
  };
};
