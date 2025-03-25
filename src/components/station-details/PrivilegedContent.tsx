
import React from 'react';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';
import LiveControls from '@/components/station-details/LiveControls';
import { useRadio } from '@/hooks/useRadioContext';

interface PrivilegedContentProps {
  station: any;
  isPrivilegedUser: boolean;
  showVideoPlayer: boolean;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
  onToggleVideo: () => void;
  onUpdateVideoStreamUrl: (url: string) => void;
}

const PrivilegedContent: React.FC<PrivilegedContentProps> = ({
  station,
  isPrivilegedUser,
  showVideoPlayer,
  onToggleLiveStatus,
  onToggleChat,
  onToggleVideo,
  onUpdateVideoStreamUrl
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
        videoStreamUrl={station.videoStreamUrl || ''}
        showVideoPlayer={showVideoPlayer}
        onToggleLiveStatus={onToggleLiveStatus}
        onToggleChat={onToggleChat}
        onToggleVideo={onToggleVideo}
        onUpdateVideoStreamUrl={onUpdateVideoStreamUrl}
      />
    </>
  );
};

export default PrivilegedContent;
