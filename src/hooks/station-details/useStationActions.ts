
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { StationDetailsActions } from './types';

export const useStationActions = (
  stationId: string | undefined,
  station: any,
  isPlaying: boolean,
  showVideoPlayer: boolean,
  setShowVideoPlayer: React.Dispatch<React.SetStateAction<boolean>>
): StationDetailsActions => {
  const { 
    setCurrentPlayingStation, 
    sendChatMessage,
    setStationLiveStatus,
    toggleChatEnabled,
    updateVideoStreamUrl,
    syncChatMessagesFromStorage
  } = useRadio();
  const { toast } = useToast();
  const navigate = useNavigate();

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
    if (station) {
      const newLiveStatus = !station.isLive;
      console.log(`Toggling station ${station.id} live status to:`, newLiveStatus);
      setStationLiveStatus(station.id, newLiveStatus, station.chatEnabled || false);
      
      if (!newLiveStatus && showVideoPlayer) {
        setShowVideoPlayer(false);
      }
    }
  }, [station, setStationLiveStatus, showVideoPlayer, setShowVideoPlayer]);

  const handleToggleChat = useCallback(() => {
    if (station) {
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
  }, [station, toggleChatEnabled, toast]);

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
    
    if (!showVideoPlayer && !station.videoStreamUrl) {
      toast({
        title: "No Video Stream Configured",
        description: "Please add an M3U8 stream URL in the broadcast controls section",
        variant: "destructive"
      });
    }
  }, [station, showVideoPlayer, setShowVideoPlayer, toast]);

  const handleUpdateVideoStreamUrl = useCallback((url: string) => {
    if (stationId) {
      updateVideoStreamUrl(stationId, url);
      toast({
        title: "Video Stream Updated",
        description: "Your video stream URL has been updated"
      });
    }
  }, [stationId, updateVideoStreamUrl, toast]);

  const handleSendMessage = useCallback((message: string) => {
    if (station && message.trim() !== '') {
      // Sync before sending to get the latest messages
      syncChatMessagesFromStorage();
      sendChatMessage(station.id, message);
    }
  }, [station, syncChatMessagesFromStorage, sendChatMessage]);

  return {
    handlePlayToggle,
    handleBookShow,
    handleToggleLiveStatus,
    handleToggleChat,
    handleToggleVideo,
    handleUpdateVideoStreamUrl,
    handleSendMessage,
    setShowVideoPlayer
  };
};
