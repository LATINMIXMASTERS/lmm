
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '@/models/Track';
import { RadioStation, BookingSlot } from '@/models/RadioStation';
import { User } from '@/contexts/auth/types';
import { useToast } from '@/hooks/use-toast';

interface UseDJProfileActionsProps {
  djUser: User;
  tracks: Track[];
  getTracksByUser: (userId: string) => Track[];
  selectedTabGenre: string;
  stations: RadioStation[];
  bookings: BookingSlot[];
}

export const useDJProfileActions = ({
  djUser,
  tracks,
  getTracksByUser,
  selectedTabGenre,
  stations,
  bookings
}: UseDJProfileActionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  
  const userTracks = getTracksByUser(djUser.id);
  const filteredTracks = userTracks.filter(track => 
    selectedTabGenre === 'all' || track.genre === selectedTabGenre
  );
  
  const djStations = stations.filter(station => 
    station.hosts && station.hosts.includes(djUser?.id || '')
  );
  
  const djBookings = bookings.filter(booking => 
    booking.hostId === djUser?.id
  );
  
  const handleTrackOperations = {
    handleEditTrack: (trackId: string) => {
      navigate(`/edit-track/${trackId}`);
    }
  };
  
  const handlePlayTrack = (trackId: string) => {
    // Handle track playback
    console.log("Playing track:", trackId);
  };

  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Like track logic
    toast({
      title: "Track liked",
      description: "This track has been added to your favorites",
    });
  };

  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Share track logic
  };

  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [trackId]: value
    }));
  };

  const handleSubmitComment = (trackId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = newComments[trackId];
    if (!comment?.trim()) return;
    
    // Add comment logic
    
    setNewComments(prev => ({
      ...prev,
      [trackId]: ''
    }));
    
    toast({
      title: "Comment added",
      description: "Your comment has been posted",
    });
  };
  
  const trackInteractions = {
    handlePlayTrack,
    handleLikeTrack,
    handleShareTrack,
    handleCommentChange,
    handleSubmitComment,
    newComments
  };
  
  return {
    handleTrackOperations,
    trackInteractions,
    userTracks,
    filteredTracks,
    djStations,
    djBookings
  };
};

export default useDJProfileActions;
