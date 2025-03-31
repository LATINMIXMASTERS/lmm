
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Host, BookingSlot } from '@/models/RadioStation';
import { useRadio } from '@/hooks/useRadioContext';
import { User } from '@/contexts/auth/types';

export const useDJProfileActions = (djProfile: User) => {
  const { stations, bookings } = useRadio();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  // Find radio stations that this DJ is a host for
  const hostStations = stations.filter(station => 
    station.hosts.some(host => host.id === djProfile.id || host.id === djProfile.username)
  );
  
  // Find bookings for this DJ
  const djBookings = bookings.filter(booking => 
    booking.userId === djProfile.id || booking.hostName === djProfile.username
  );
  
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
      image: djProfile.avatarUrl
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
    loading
  };
};

export default useDJProfileActions;
