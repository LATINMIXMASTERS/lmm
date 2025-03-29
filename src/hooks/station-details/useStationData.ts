
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { StationDetailsState } from './types';

export const useStationData = (stationId: string | undefined): StationDetailsState => {
  const { stations, getBookingsForStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());
  const [loadingState, setLoadingState] = useState({
    isLoading: true,
    hasError: false,
    errorMessage: ''
  });

  // Fetch and update station data
  useEffect(() => {
    if (!stationId) return;
    
    try {
      setLoadingState({ isLoading: true, hasError: false, errorMessage: '' });
      
      const foundStation = stations.find(s => s.id === stationId);
      if (foundStation) {
        setStation(foundStation);
        const bookings = getBookingsForStation(stationId);
        setStationBookings(bookings.filter(b => b.approved && !b.rejected));
        setLoadingState({ isLoading: false, hasError: false, errorMessage: '' });
      } else {
        console.error("Station not found with ID:", stationId);
        setLoadingState({ 
          isLoading: false, 
          hasError: true, 
          errorMessage: 'Station not found' 
        });
        
        // Only navigate away if we've confirmed the station doesn't exist
        if (stations.length > 0) {
          toast({
            title: "Station not found",
            description: "The station you're looking for doesn't exist",
            variant: "destructive"
          });
          navigate('/stations');
        }
      }
    } catch (error) {
      console.error("Error loading station details:", error);
      setLoadingState({ 
        isLoading: false, 
        hasError: true, 
        errorMessage: 'Error loading station' 
      });
    }
  }, [stationId, stations, getBookingsForStation, navigate, toast]);

  return {
    station,
    stationBookings,
    showVideoPlayer,
    lastSyncTime,
    loadingState
  };
};
