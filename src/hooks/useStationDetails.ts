
import { useState, useEffect } from 'react';
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
  
  const isPlaying = currentPlayingStation === stationId;
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;

  useEffect(() => {
    console.log("StationDetails initializing with ID:", stationId);
  }, [stationId]);

  // Fetch and update station data
  useEffect(() => {
    if (stationId) {
      console.log("Looking for station with ID:", stationId);
      console.log("Available stations:", stations.map(s => ({ id: s.id, name: s.name })));
      
      const foundStation = stations.find(s => s.id === stationId);
      if (foundStation) {
        console.log("Found station:", {
          id: foundStation.id,
          name: foundStation.name,
          isLive: foundStation.isLive,
          videoStreamUrl: foundStation.videoStreamUrl
        });
        
        setStation(foundStation);
        const bookings = getBookingsForStation(stationId);
        setStationBookings(bookings.filter(b => b.approved && !b.rejected));
      } else {
        console.error("Station not found with ID:", stationId);
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    }
  }, [stationId, stations, getBookingsForStation, navigate, toast]);

  // Sync chat messages periodically
  useEffect(() => {
    if (!stationId) return;
    
    // Force refresh chat messages when component mounts
    syncChatMessagesFromStorage();
    setLastSyncTime(new Date());
    
  }, [stationId, syncChatMessagesFromStorage]);

  const handlePlayToggle = () => {
    if (isPlaying) {
      setCurrentPlayingStation(null);
    } else {
      if (station?.streamUrl) {
        setCurrentPlayingStation(station.id);
      } else {
        toast({
          title: "Stream Not Available",
          description: "This station doesn't have a stream URL configured.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBookShow = () => {
    navigate(`/book-show/${station.id}`);
  };

  const handleToggleLiveStatus = () => {
    if (isPrivilegedUser) {
      const newLiveStatus = !station.isLive;
      console.log(`Toggling station ${station.id} live status to:`, newLiveStatus);
      setStationLiveStatus(station.id, newLiveStatus, station.chatEnabled || false);
      
      if (!newLiveStatus && showVideoPlayer) {
        setShowVideoPlayer(false);
      }
    }
  };

  const handleToggleChat = () => {
    if (isPrivilegedUser) {
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
  };

  const handleToggleVideo = () => {
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
    
    if (!showVideoPlayer) {
      if (!station.videoStreamUrl && isPrivilegedUser) {
        toast({
          title: "No Video Stream Configured",
          description: "Please add an M3U8 stream URL in the broadcast controls section",
          variant: "destructive"
        });
      }
    }
  };

  const handleUpdateVideoStreamUrl = (url: string) => {
    if (isPrivilegedUser && stationId) {
      updateVideoStreamUrl(stationId, url);
    }
  };

  const handleSendMessage = (message: string) => {
    if (station) {
      // Sync before sending to get the latest messages
      syncChatMessagesFromStorage();
      sendChatMessage(station.id, message);
    }
  };

  // Get chat messages with forced refresh
  const chatMessages = station ? getChatMessagesForStation(station.id) : [];

  return {
    station,
    stationBookings,
    isPlaying,
    isPrivilegedUser,
    showVideoPlayer,
    chatMessages,
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
