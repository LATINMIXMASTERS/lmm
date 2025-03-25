
import React from 'react';
import StationDescription from '@/components/station-details/StationDescription';
import UpcomingShows from '@/components/station-details/UpcomingShows';
import ChatRoom from '@/components/station-details/ChatRoom';
import PrivilegedContent from '@/components/station-details/PrivilegedContent';
import VideoPlayer from '@/components/station-details/VideoPlayer';

interface StationContentProps {
  station: any;
  stationBookings: any[];
  isPrivilegedUser: boolean;
  chatMessages: any[];
  showVideoPlayer: boolean;
  onSendMessage: (message: string) => void;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
  onToggleVideo: () => void;
  onUpdateVideoStreamUrl: (url: string) => void;
}

const StationContent: React.FC<StationContentProps> = ({
  station,
  stationBookings,
  isPrivilegedUser,
  chatMessages,
  showVideoPlayer,
  onSendMessage,
  onToggleLiveStatus,
  onToggleChat,
  onToggleVideo,
  onUpdateVideoStreamUrl
}) => {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <StationDescription
        description={station.description}
        broadcastTime={station.broadcastTime}
      />
      
      {/* Privileged User Content */}
      <PrivilegedContent 
        station={station}
        isPrivilegedUser={isPrivilegedUser}
        showVideoPlayer={showVideoPlayer}
        onToggleLiveStatus={onToggleLiveStatus}
        onToggleChat={onToggleChat}
        onToggleVideo={onToggleVideo}
        onUpdateVideoStreamUrl={onUpdateVideoStreamUrl}
      />
      
      {/* Embed Video Player above chat when visible */}
      {station.isLive && showVideoPlayer && (
        <div className="mb-6 mt-4 rounded-md overflow-hidden border border-border">
          <VideoPlayer 
            streamUrl={station.videoStreamUrl || ''}
            isVisible={showVideoPlayer}
            onClose={onToggleVideo}
            embedded={true}
          />
        </div>
      )}
      
      {/* Show chatroom when station is live and chat is enabled */}
      {station.isLive && station.chatEnabled && (
        <div className="mb-8">
          <ChatRoom 
            stationId={station.id}
            messages={chatMessages}
            onSendMessage={onSendMessage}
          />
        </div>
      )}
      
      {/* Show upcoming bookings/shows calendar */}
      <UpcomingShows bookings={stationBookings} />
    </div>
  );
};

export default StationContent;
