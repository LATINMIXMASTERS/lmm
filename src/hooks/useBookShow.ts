
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { RadioStation } from '@/models/RadioStation';

export const useBookShow = (stationId: string | undefined) => {
  const { isAuthenticated, user } = useAuth();
  const { stations, addBooking, hasBookingConflict } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<RadioStation | null>(null);
  
  // Check if user is admin or host (privileged users)
  const isPrivilegedUser = isAuthenticated && (user?.isAdmin || user?.isRadioHost);
  
  useEffect(() => {
    // Redirect if not authenticated or not a host/admin
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!isPrivilegedUser) {
      navigate('/stations');
      toast({
        title: "Access Denied",
        description: "Only hosts and admins can book shows",
        variant: "destructive"
      });
      return;
    }
    
    if (stationId) {
      const foundStation = stations.find(s => s.id === stationId);
      if (foundStation) {
        setStation(foundStation);
      } else {
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    } else {
      navigate('/stations');
    }
  }, [stationId, stations, isAuthenticated, isPrivilegedUser, navigate, toast]);

  const handleBookShow = (bookingData: {
    stationId: string;
    hostId: string;
    hostName: string;
    title: string;
    startTime: string;
    endTime: string;
    approved: boolean;
  }) => {
    const newBooking = addBooking(bookingData);
    
    const approvalMessage = bookingData.approved 
      ? "Your show has been booked successfully!"
      : "Your booking request has been submitted for approval";
    
    toast({
      title: bookingData.approved ? "Show Booked" : "Request Submitted",
      description: approvalMessage,
    });
    
    navigate('/stations');
    return newBooking;
  };

  return {
    station,
    isPrivilegedUser,
    userId: user?.id || '',
    username: user?.username || 'Anonymous',
    hasBookingConflict,
    handleBookShow,
  };
};
