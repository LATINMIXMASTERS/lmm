
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
  // Call useRandomListeners hook unconditionally at the top level
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
    toggleChatEnabled
  } = useRadio();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const isPlaying = currentPlayingStation === id;
  
  // Check if user is admin or host (privileged users)
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;

  useEffect(() => {
    if (id) {
      const foundStation = stations.find(s => s.id === id);
      if (foundStation) {
        setStation(foundStation);
        // Get this station's bookings
        const bookings = getBookingsForStation(id);
        setStationBookings(bookings.filter(b => b.approved && !b.rejected));
      } else {
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

  // For demo/testing purposes, admin users can toggle live status
  const handleToggleLiveStatus = () => {
    if (isPrivilegedUser) {
      setStationLiveStatus(station.id, !station.isLive, station.chatEnabled || false);
    }
  };
  
  // Toggle chat functionality for live stations
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

  // Handle video toggle
  const handleToggleVideo = () => {
    if (station.videoStreamUrl) {
      setShowVideoPlayer(!showVideoPlayer);
      
      // If turning on video, show a toast notification
      if (!showVideoPlayer) {
        toast({
          title: "Video stream enabled",
          description: "Loading video stream for this station"
        });
      }
    } else {
      toast({
        title: "No Video Stream",
        description: "This station doesn't have a video stream URL configured.",
        variant: "destructive"
      });
    }
  };

  // Get chat messages for this station
  const chatMessages = getChatMessagesForStation(station.id);

  // Handler for sending chat messages
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
              onSendMessage={handleSendMessage}
              onToggleLiveStatus={handleToggleLiveStatus}
              onToggleChat={handleToggleChat}
            />
          </CardContent>
        </Card>
      </div>
      
      {/* Video Player Component - always render it but control visibility */}
      {station.videoStreamUrl && (
        <VideoPlayer 
          streamUrl={station.videoStreamUrl}
          isVisible={showVideoPlayer}
          onClose={() => setShowVideoPlayer(false)}
        />
      )}
    </MainLayout>
  );
};

export default StationDetails;
