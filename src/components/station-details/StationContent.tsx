
import React from 'react';
import StationDescription from '@/components/station-details/StationDescription';
import UpcomingShows from '@/components/station-details/UpcomingShows';
import ChatRoom from '@/components/station-details/ChatRoom';
import PrivilegedContent from '@/components/station-details/PrivilegedContent';

interface StationContentProps {
  station: any;
  stationBookings: any[];
  isPrivilegedUser: boolean;
  chatMessages: any[];
  onSendMessage: (message: string) => void;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
}

const StationContent: React.FC<StationContentProps> = ({
  station,
  stationBookings,
  isPrivilegedUser,
  chatMessages,
  onSendMessage,
  onToggleLiveStatus,
  onToggleChat
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
        onToggleLiveStatus={onToggleLiveStatus}
        onToggleChat={onToggleChat}
      />
      
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
