
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
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
    setStationLiveStatus
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
      setStationLiveStatus(station.id, !station.isLive);
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
              
              {/* Admin toggle for live status (for demo purposes) */}
              {isPrivilegedUser && (
                <div className="mb-6 mt-4">
                  <button
                    onClick={handleToggleLiveStatus}
                    className={`px-4 py-2 rounded-md ${
                      station.isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                    } text-white transition-colors`}
                  >
                    {station.isLive ? 'End Live Session' : 'Start Live Session'}
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    This button is for demonstration purposes - in production, live status would be determined by actual streaming activity.
                  </p>
                </div>
              )}
              
              {/* Show chatroom when station is live */}
              {station.isLive && (
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
