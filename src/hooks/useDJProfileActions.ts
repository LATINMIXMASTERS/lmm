
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Host, BookingSlot } from '@/models/RadioStation';
import { useRadio } from '@/hooks/useRadioContext';
import { User } from '@/contexts/auth/types';
import { useTrack } from '@/hooks/useTrackContext';
import { Track } from '@/models/Track'; 

// Extended User type that includes optional properties needed
interface ExtendedUser extends User {
  title?: string;
  avatarUrl?: string;
}

export const useDJProfileActions = (djProfile: ExtendedUser) => {
  const { stations, bookings } = useRadio();
  const { toast } = useToast();
  const { tracks, getTracksByUser } = useTrack();
  const [loading, setLoading] = useState(false);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  
  // Find radio stations that this DJ is a host for
  const hostStations = stations.filter(station => 
    station.hosts.some(host => host.id === djProfile.id || host.id === djProfile.username)
  );
  
  // Find bookings for this DJ
  const djBookings = bookings.filter(booking => 
    booking.userId === djProfile.id || booking.hostName === djProfile.username
  );
  
  // Get user tracks
  const userTracks = getTracksByUser(djProfile.id);
  
  // Filter tracks by selected genre
  const filteredTracks = selectedTabGenre === 'all' 
    ? userTracks 
    : userTracks.filter(track => track.genre === selectedTabGenre);
  
  // Track operations
  const handleTrackOperations = {
    handleEditTrack: (trackId: string) => {
      console.log(`Edit track: ${trackId}`);
    },
    // Add other track operations if needed
  };
  
  // Track interactions
  const trackInteractions = {
    handlePlayTrack: (trackId: string) => {
      setCurrentPlayingTrack(trackId);
    },
    handleLikeTrack: (track: Track) => {
      console.log(`Like track: ${track.id}`);
    },
    handleShareTrack: (track: Track) => {
      console.log(`Share track: ${track.id}`);
    },
    handleCommentChange: (trackId: string, comment: string) => {
      console.log(`Comment on track ${trackId}: ${comment}`);
    },
    handleSubmitComment: (trackId: string, comment: string) => {
      console.log(`Submit comment on track ${trackId}: ${comment}`);
    },
    newComments: {} as Record<string, string>
  };
  
  // Get upcoming approved shows
  const upcomingShows = djBookings.filter(booking => 
    booking.approved && new Date(booking.startTime) > new Date()
  ).sort((a, b) => 
    new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );
  
  // Convert DJ to host
  const getHostFromDJ = useCallback((): Host => {
    return {
      id: djProfile.id,
      name: djProfile.username,
      role: djProfile.title || 'DJ',
      image: djProfile.avatarUrl || ''
    };
  }, [djProfile]);
  
  // Follow/unfollow a DJ
  const toggleFollow = useCallback(() => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success!",
        description: `You are now following ${djProfile.username}`
      });
      setLoading(false);
    }, 1000);
  }, [djProfile, toast]);
  
  return {
    hostStations,
    upcomingShows,
    djBookings,
    getHostFromDJ,
    toggleFollow,
    loading,
    // Add missing properties
    handleTrackOperations,
    trackInteractions,
    userTracks,
    filteredTracks,
    djStations: hostStations
  };
};

export default useDJProfileActions;
