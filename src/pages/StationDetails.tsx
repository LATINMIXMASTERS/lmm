
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import StationHeader from '@/components/station-details/StationHeader';
import StationControls from '@/components/station-details/StationControls';
import StationDescription from '@/components/station-details/StationDescription';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';
import UpcomingShows from '@/components/station-details/UpcomingShows';
import ChatRoom from '@/components/station-details/ChatRoom';

const StationDetails: React.FC = () => {
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
    return null;
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      setCurrentPlayingStation(null);
    } else {
      if (station?.streamUrl) {
        setCurrentPlayingStation(station.id);
        toast({
          title: "Now Playing",
          description: `${station.name} - Shoutcast stream started`
        });
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

  // Get chat messages for this station
  const chatMessages = getChatMessagesForStation(station.id);

  // Handler for sending chat messages
  const handleSendMessage = (message: string) => {
    sendChatMessage(station.id, message);
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <Card className="overflow-hidden">
          <StationHeader
            stationName={station.name}
            genre={station.genre}
            imageUrl={station.image}
          />
          
          <CardContent className="p-6">
            <StationControls
              isPlaying={isPlaying}
              listeners={station.listeners}
              isPrivilegedUser={isPrivilegedUser}
              onPlayToggle={handlePlayToggle}
              onBookShow={handleBookShow}
            />
            
            <div className="prose prose-slate max-w-none">
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
                <div className="mb-6 mt-4 space-y-4">
                  <div className="flex flex-col gap-4 p-4 border rounded-md bg-gray-50">
                    <h3 className="text-lg font-medium">Broadcast Controls</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={station.isLive} 
                          onCheckedChange={handleToggleLiveStatus} 
                          id="live-status"
                        />
                        <label htmlFor="live-status" className="cursor-pointer">
                          {station.isLive ? 
                            <Badge variant="destructive" className="animate-pulse">LIVE</Badge> : 
                            'Go Live'}
                        </label>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Station is currently {station.isLive ? 'broadcasting live' : 'offline'}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={station.chatEnabled || false} 
                          onCheckedChange={handleToggleChat}
                          disabled={!station.isLive}
                          id="chat-status"
                        />
                        <label htmlFor="chat-status" className={`cursor-pointer ${!station.isLive ? 'text-gray-400' : ''}`}>
                          {station.chatEnabled ? 
                            <Badge className="bg-green-500">Chat Enabled</Badge> : 
                            'Enable Chat'}
                        </label>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {!station.isLive ? 
                          'Set station to live first' : 
                          (station.chatEnabled ? 'Chat is active' : 'Chat is disabled')}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-500">
                    These controls are for demonstration purposes - in production, live status would be determined by actual streaming activity.
                  </p>
                </div>
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
    </MainLayout>
  );
};

export default StationDetails;
