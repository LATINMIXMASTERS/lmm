
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { Comment } from '@/models/Track';

export const useTrackInteractions = () => {
  const { isAuthenticated, user } = useAuth();
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
  
  const [newComments, setNewComments] = useState<Record<string, string>>({});

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

  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId === currentPlayingTrack ? null : trackId);
  };

  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeTrack(trackId);
  };

  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  const handleEditTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-track/${trackId}`);
  };

  const handleDeleteTrack = (trackId: string) => {
    deleteTrack(trackId);
  };

  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments({
      ...newComments,
      [trackId]: value
    });
  };

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
    
    setNewComments({
      ...newComments,
      [trackId]: ''
    });
  };

  // Fixed to return null instead of boolean
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
