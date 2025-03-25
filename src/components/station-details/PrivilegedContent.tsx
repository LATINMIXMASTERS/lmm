
import React from 'react';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';
import LiveControls from '@/components/station-details/LiveControls';

interface PrivilegedContentProps {
  station: any;
  isPrivilegedUser: boolean;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
}

const PrivilegedContent: React.FC<PrivilegedContentProps> = ({
  station,
  isPrivilegedUser,
  onToggleLiveStatus,
  onToggleChat
}) => {
  if (!isPrivilegedUser) return null;
  
  return (
    <>
      {station.streamDetails && (
        <StreamDetails
          url={station.streamDetails.url}
          port={station.streamDetails.port}
          password={station.streamDetails.password}
        />
      )}
      
      <StreamingInstructions
        stationName={station.name}
        streamUrl={station.streamDetails?.url}
        streamPort={station.streamDetails?.port}
      />
      
      <LiveControls
        stationId={station.id}
        isLive={station.isLive}
        chatEnabled={station.chatEnabled}
        onToggleLiveStatus={onToggleLiveStatus}
        onToggleChat={onToggleChat}
      />
    </>
  );
};

export default PrivilegedContent;
