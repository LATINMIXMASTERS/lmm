
import React, { useEffect, useState, useCallback } from 'react';
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
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { syncChatMessagesFromStorage, clearChatMessagesForStation } = useRadio();
  const [syncTime, setSyncTime] = useState(new Date());
  const [syncIntervalId, setSyncIntervalId] = useState<number | null>(null);
  
  // Custom hook for random listeners is used outside of component to avoid re-renders
  useRandomListeners();
  
  const {
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
    handleSendMessage
  } = useStationDetails(id);

  // Set up more efficient sync when chat is visible and enabled
  useEffect(() => {
    // Clean up any existing interval first
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      setSyncIntervalId(null);
    }
    
    if (!id || !station?.isLive || !station?.chatEnabled) return;
    
    // Initial sync on page load
    syncChatMessagesFromStorage();
    setSyncTime(new Date());
    
    // Set up periodic sync with a more efficient interval
    const intervalId = window.setInterval(() => {
      syncChatMessagesFromStorage();
      setSyncTime(new Date());
    }, 5000); // Sync every 5 seconds when chat is active
    
    setSyncIntervalId(intervalId);
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
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
      setSyncTime(new Date());
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
      if (id && !station?.isLive && clearChatMessagesForStation) {
        // Clear messages for this station when user leaves the page and station is not live
        clearChatMessagesForStation(id);
        console.log(`Cleaned up chat messages for station ${id} on page leave`);
      }
    };
  }, [id, station?.isLive, clearChatMessagesForStation]);

  const handleShareStation = useCallback(() => {
    if (!station) return;
    
    const url = window.location.href;
    const title = `Listen to ${station.name} on LATINMIXMASTERS`;
    const text = `Check out ${station.name} - ${station.genre} on LATINMIXMASTERS Radio!`;
    
    if (navigator.share) {
      navigator.share({
        title,
        text,
        url
      })
      .then(() => {
        toast({
          title: "Shared Successfully",
          description: "Thanks for sharing our station!"
        });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
          // Fallback to copy link if sharing fails
          handleCopyLink();
        }
      });
    } else {
      // Fallback for browsers that don't support Web Share API
      handleCopyLink();
    }
  }, [station, toast]);
  
  const handleCopyLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Station link copied to clipboard!"
        });
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        toast({
          title: "Copy Failed",
          description: "Could not copy link to clipboard",
          variant: "destructive"
        });
      });
  }, [toast]);

  if (loadingState?.isLoading || !station) {
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
            <div className="flex justify-between items-center mb-4">
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
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareStation}
                className="flex items-center gap-1"
              >
                <Share2 className="w-4 h-4" />
                <span className="hidden sm:inline">Share Station</span>
              </Button>
            </div>
            
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
              lastSyncTime={syncTime}
            />
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StationDetails;
