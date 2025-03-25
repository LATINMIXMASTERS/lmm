import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import StationHeader from '@/components/station-details/StationHeader';
import StationDetailSkeleton from '@/components/station-details/StationDetailSkeleton';
import VideoPlayer from '@/components/station-details/VideoPlayer';
import useRandomListeners from '@/hooks/useRandomListeners';
import ControlsSection from '@/components/station-details/ControlsSection';
import StationContent from '@/components/station-details/StationContent';

const StationDetails: React.FC = () => {
  useRandomListeners();
  
  const { id } = useParams<{ id: string }>();
  const { 
    stations, 
    currentPlayingStation, 
    setCurrentPlayingStation, 
    getBookingsForStation,
    getChatMessagesForStation,
    sendChatMessage,
    setStationLiveStatus,
    toggleChatEnabled,
    updateVideoStreamUrl
  } = useRadio();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const isPlaying = currentPlayingStation === id;
  
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;

  useEffect(() => {
    console.log("StationDetails initializing with ID:", id);
  }, [id]);

  useEffect(() => {
    if (id) {
      console.log("Looking for station with ID:", id);
      console.log("Available stations:", stations.map(s => ({ id: s.id, name: s.name })));
      
      const foundStation = stations.find(s => s.id === id);
      if (foundStation) {
        console.log("Found station:", {
          id: foundStation.id,
          name: foundStation.name,
          isLive: foundStation.isLive,
          videoStreamUrl: foundStation.videoStreamUrl
        });
        
        setStation(foundStation);
        const bookings = getBookingsForStation(id);
        setStationBookings(bookings.filter(b => b.approved && !b.rejected));
      } else {
        console.error("Station not found with ID:", id);
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    }
  }, [id, stations, getBookingsForStation, navigate, toast]);

  if (!station) {
    return <StationDetailSkeleton />;
  }

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
    if (isPrivilegedUser && id) {
      updateVideoStreamUrl(id, url);
    }
  };

  const chatMessages = getChatMessagesForStation(station.id);

  const handleSendMessage = (message: string) => {
    sendChatMessage(station.id, message);
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <Card className="overflow-hidden border border-border">
          <StationHeader
            stationName={station.name}
            genre={station.genre}
            imageUrl={station.image}
          />
          
          <CardContent className="p-6 bg-card text-card-foreground">
            <ControlsSection 
              isPlaying={isPlaying}
              station={station}
              isPrivilegedUser={isPrivilegedUser}
              listeners={station.listeners}
              showVideoPlayer={showVideoPlayer}
              onPlayToggle={handlePlayToggle}
              onBookShow={handleBookShow}
              onToggleVideo={handleToggleVideo}
            />
            
            <StationContent 
              station={station}
              stationBookings={stationBookings}
              isPrivilegedUser={isPrivilegedUser}
              chatMessages={chatMessages}
              showVideoPlayer={showVideoPlayer}
              onSendMessage={handleSendMessage}
              onToggleLiveStatus={handleToggleLiveStatus}
              onToggleChat={handleToggleChat}
              onToggleVideo={handleToggleVideo}
              onUpdateVideoStreamUrl={handleUpdateVideoStreamUrl}
            />
          </CardContent>
        </Card>
      </div>
      
      {!showVideoPlayer && (
        <>{
          console.log("Video player state:", {
            streamUrl: station.videoStreamUrl || 'none',
            isVisible: showVideoPlayer
          })
        }</>
      )}
    </MainLayout>
  );
};

export default StationDetails;
