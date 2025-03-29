
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadio } from '@/hooks/useRadioContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useStationDetails = (stationId: string | undefined) => {
  const { 
    stations, 
    currentPlayingStation, 
    setCurrentPlayingStation, 
    getBookingsForStation,
    getChatMessagesForStation,
    sendChatMessage,
    setStationLiveStatus,
    toggleChatEnabled,
    updateVideoStreamUrl,
    syncChatMessagesFromStorage
  } = useRadio();
  const { user } = useAuth();
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
  
  const isPlaying = currentPlayingStation === stationId;
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;

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

  // Sync chat messages periodically
  useEffect(() => {
    if (!stationId || !station?.isLive || !station?.chatEnabled) return;
    
    // Initial sync on page load
    syncChatMessagesFromStorage();
    setLastSyncTime(new Date());
    
    // Set up periodic sync with a short interval when chat is active
    const syncInterval = setInterval(() => {
      syncChatMessagesFromStorage();
      setLastSyncTime(new Date());
    }, 3000); // Sync every 3 seconds when chat is active
    
    return () => clearInterval(syncInterval);
  }, [stationId, syncChatMessagesFromStorage, station?.isLive, station?.chatEnabled]);

  // Handle play toggle with error handling
  const handlePlayToggle = useCallback(() => {
    if (isPlaying) {
      setCurrentPlayingStation(null);
    } else {
      if (station?.streamUrl || (station?.streamDetails?.url && station?.streamDetails?.url.trim() !== '')) {
        setCurrentPlayingStation(station.id);
      } else {
        toast({
          title: "Stream Not Available",
          description: "This station doesn't have a stream URL configured.",
          variant: "destructive"
        });
      }
    }
  }, [isPlaying, station, setCurrentPlayingStation, toast]);

  const handleBookShow = useCallback(() => {
    if (station) {
      navigate(`/book-show/${station.id}`);
    }
  }, [station, navigate]);

  const handleToggleLiveStatus = useCallback(() => {
    if (isPrivilegedUser && station) {
      const newLiveStatus = !station.isLive;
      console.log(`Toggling station ${station.id} live status to:`, newLiveStatus);
      setStationLiveStatus(station.id, newLiveStatus, station.chatEnabled || false);
      
      if (!newLiveStatus && showVideoPlayer) {
        setShowVideoPlayer(false);
      }
    }
  }, [isPrivilegedUser, station, setStationLiveStatus, showVideoPlayer]);

  const handleToggleChat = useCallback(() => {
    if (isPrivilegedUser && station) {
      if (station.isLive) {
        toggleChatEnabled(station.id, !station.chatEnabled);
      } else {
        toast({
          title: "Station Not Live",
          description: "You need to set the station to live before enabling chat.",
          variant: "destructive"
        });
      }
    }
  }, [isPrivilegedUser, station, toggleChatEnabled, toast]);

  const handleToggleVideo = useCallback(() => {
    if (!station) return;
    
    console.log("Toggle video called. Current state:", {
      showVideoPlayer,
      videoStreamUrl: station.videoStreamUrl,
      isLive: station.isLive
    });
    
    if (!station.isLive && !showVideoPlayer) {
      toast({
        title: "Station Not Live",
        description: "The video stream is only available when the station is live",
        variant: "destructive"
      });
      return;
    }
    
    setShowVideoPlayer(!showVideoPlayer);
    
    if (!showVideoPlayer && !station.videoStreamUrl && isPrivilegedUser) {
      toast({
        title: "No Video Stream Configured",
        description: "Please add an M3U8 stream URL in the broadcast controls section",
        variant: "destructive"
      });
    }
  }, [station, showVideoPlayer, isPrivilegedUser, toast]);

  const handleUpdateVideoStreamUrl = useCallback((url: string) => {
    if (isPrivilegedUser && stationId) {
      updateVideoStreamUrl(stationId, url);
      toast({
        title: "Video Stream Updated",
        description: "Your video stream URL has been updated"
      });
    }
  }, [isPrivilegedUser, stationId, updateVideoStreamUrl, toast]);

  const handleSendMessage = useCallback((message: string) => {
    if (station && message.trim() !== '') {
      // Sync before sending to get the latest messages
      syncChatMessagesFromStorage();
      sendChatMessage(station.id, message);
    }
  }, [station, syncChatMessagesFromStorage, sendChatMessage]);

  // Get chat messages with forced refresh
  const chatMessages = station ? getChatMessagesForStation(station.id) : [];

  return {
    station,
    stationBookings,
    isPlaying,
    isPrivilegedUser,
    showVideoPlayer,
    chatMessages,
    loadingState,
    handlePlayToggle,
    handleBookShow,
    handleToggleLiveStatus,
    handleToggleChat,
    handleToggleVideo,
    handleUpdateVideoStreamUrl,
    handleSendMessage,
    setShowVideoPlayer,
    lastSyncTime
  };
};

export default useStationDetails;
