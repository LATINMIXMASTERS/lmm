
import React from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import StationHeader from '@/components/station-details/StationHeader';
import StationDetailSkeleton from '@/components/station-details/StationDetailSkeleton';
import ControlsSection from '@/components/station-details/ControlsSection';
import StationContent from '@/components/station-details/StationContent';
import useStationDetails from '@/hooks/useStationDetails';
import useRandomListeners from '@/hooks/useRandomListeners';

const StationDetails: React.FC = () => {
  useRandomListeners();
  const { id } = useParams<{ id: string }>();
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
      
      {/* Move console.log statements outside of JSX or wrap in empty fragments */}
      <>{
        console.log("Video player state:", {
          streamUrl: station.videoStreamUrl || 'none',
          isVisible: showVideoPlayer
        })
      }</>
    </MainLayout>
  );
};

export default StationDetails;
