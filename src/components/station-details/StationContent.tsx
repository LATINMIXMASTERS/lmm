import React, { memo } from 'react';
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
  lastSyncTime?: Date;
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
  onUpdateVideoStreamUrl,
  lastSyncTime
}) => {
  const shouldShowChat = station.isLive && station.chatEnabled;
  
  const renderedDescription = (
    <StationDescription
      description={station.description}
      broadcastTime={station.broadcastTime}
    />
  );
  
  const renderedPrivilegedContent = isPrivilegedUser ? (
    <PrivilegedContent 
      station={station}
      isPrivilegedUser={isPrivilegedUser}
      showVideoPlayer={showVideoPlayer}
      onToggleLiveStatus={onToggleLiveStatus}
      onToggleChat={onToggleChat}
      onToggleVideo={onToggleVideo}
      onUpdateVideoStreamUrl={onUpdateVideoStreamUrl}
    />
  ) : null;
  
  const renderedVideoPlayer = station.isLive && showVideoPlayer ? (
    <div className="mb-6 mt-4 rounded-md overflow-hidden border border-border">
      <VideoPlayer 
        streamUrl={station.videoStreamUrl || ''}
        isVisible={showVideoPlayer}
        onClose={onToggleVideo}
        embedded={true}
      />
    </div>
  ) : null;
  
  const renderedChatRoom = shouldShowChat ? (
    <div className="mb-8">
      <ChatRoom 
        stationId={station.id}
        messages={chatMessages}
        onSendMessage={onSendMessage}
        lastSyncTime={lastSyncTime}
      />
    </div>
  ) : null;
  
  const renderedUpcomingShows = (
    <UpcomingShows bookings={stationBookings} />
  );
  
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {renderedDescription}
      {renderedPrivilegedContent}
      {renderedVideoPlayer}
      {renderedChatRoom}
      {renderedUpcomingShows}
    </div>
  );
};

export default memo(StationContent);
