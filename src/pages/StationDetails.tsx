
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import StationHeader from '@/components/station-details/StationHeader';
import StationControls from '@/components/station-details/StationControls';
import StationDescription from '@/components/station-details/StationDescription';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';
import UpcomingShows from '@/components/station-details/UpcomingShows';
import ChatRoom from '@/components/station-details/ChatRoom';
import VideoPlayer from '@/components/station-details/VideoPlayer';
import LiveControls from '@/components/station-details/LiveControls';
import VideoToggle from '@/components/station-details/VideoToggle';
import StationDetailSkeleton from '@/components/station-details/StationDetailSkeleton';
import useRandomListeners from '@/hooks/useRandomListeners';

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
            <StationControls
              isPlaying={isPlaying}
              listeners={station.listeners}
              isPrivilegedUser={isPrivilegedUser}
              onPlayToggle={handlePlayToggle}
              onBookShow={handleBookShow}
            />
            
            {/* Video Toggle Button */}
            <VideoToggle 
              isLive={station.isLive}
              hasVideoStream={!!station.videoStreamUrl}
              showVideoPlayer={showVideoPlayer}
              onToggleVideo={handleToggleVideo}
            />
            
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <StationDescription
                description={station.description}
                broadcastTime={station.broadcastTime}
              />
              
              {/* Only show stream details to privileged users */}
              {isPrivilegedUser && station.streamDetails && (
                <StreamDetails
                  url={station.streamDetails.url}
                  port={station.streamDetails.port}
                  password={station.streamDetails.password}
                />
              )}
              
              {/* Show streaming instructions for hosts */}
              {isPrivilegedUser && (
                <StreamingInstructions
                  stationName={station.name}
                  streamUrl={station.streamDetails?.url}
                  streamPort={station.streamDetails?.port}
                />
              )}
              
              {/* Live status and chat controls for admins/hosts */}
              {isPrivilegedUser && (
                <LiveControls
                  stationId={station.id}
                  isLive={station.isLive}
                  chatEnabled={station.chatEnabled}
                  onToggleLiveStatus={handleToggleLiveStatus}
                  onToggleChat={handleToggleChat}
                />
              )}
              
              {/* Show chatroom when station is live and chat is enabled */}
              {station.isLive && station.chatEnabled && (
                <div className="mb-8">
                  <ChatRoom 
                    stationId={station.id}
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                  />
                </div>
              )}
              
              {/* Show upcoming bookings/shows calendar */}
              <UpcomingShows bookings={stationBookings} />
            </div>
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
