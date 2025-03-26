
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import StationHeader from '@/components/station-details/StationHeader';
import StationDetailSkeleton from '@/components/station-details/StationDetailSkeleton';
import ControlsSection from '@/components/station-details/ControlsSection';
import StationContent from '@/components/station-details/StationContent';
import useStationDetails from '@/hooks/useStationDetails';
import useRandomListeners from '@/hooks/useRandomListeners';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';

const StationDetails: React.FC = () => {
  useRandomListeners();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { syncChatMessagesFromStorage } = useRadio();
  
  const {
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
    handleSendMessage
  } = useStationDetails(id);

  // Set up more aggressive sync when chat is visible and enabled
  useEffect(() => {
    if (!id || !station?.isLive || !station?.chatEnabled) return;
    
    // Initial sync on page load
    syncChatMessagesFromStorage();
    
    // Set up periodic sync with a short interval when chat is active
    const syncInterval = setInterval(() => {
      syncChatMessagesFromStorage();
    }, 3000); // Sync every 3 seconds when chat is active
    
    return () => clearInterval(syncInterval);
  }, [id, syncChatMessagesFromStorage, station?.isLive, station?.chatEnabled]);

  // Handle connection issues
  useEffect(() => {
    const handleOffline = () => {
      toast({
        title: "Connection Lost",
        description: "You are currently offline. Chat messages may not sync properly.",
        variant: "destructive"
      });
    };
    
    const handleOnline = () => {
      toast({
        title: "Connection Restored",
        description: "You're back online. Syncing chat messages...",
      });
      syncChatMessagesFromStorage();
    };
    
    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [toast, syncChatMessagesFromStorage]);

  // Automatically clean up chat messages on component unmount if not live
  useEffect(() => {
    return () => {
      if (id && !station?.isLive && syncChatMessagesFromStorage) {
        // Clear messages for this station when user leaves the page and station is not live
        const chatData = localStorage.getItem('latinmixmasters_chat_messages');
        if (chatData) {
          try {
            const parsedData = JSON.parse(chatData);
            if (parsedData[id]) {
              delete parsedData[id];
              localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(parsedData));
              console.log(`Cleaned up chat messages for station ${id} on page leave`);
            }
          } catch (error) {
            console.error("Failed to clean up chat messages:", error);
          }
        }
      }
    };
  }, [id, station?.isLive]);

  if (!station) {
    return <StationDetailSkeleton />;
  }

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
    </MainLayout>
  );
};

export default StationDetails;
