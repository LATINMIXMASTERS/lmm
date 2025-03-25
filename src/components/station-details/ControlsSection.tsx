
import React from 'react';
import StationControls from '@/components/station-details/StationControls';
import VideoToggle from '@/components/station-details/VideoToggle';
import { useToast } from '@/hooks/use-toast';

interface ControlsSectionProps {
  isPlaying: boolean;
  station: any;
  isPrivilegedUser: boolean;
  listeners: number;
  showVideoPlayer: boolean;
  onPlayToggle: () => void;
  onBookShow: () => void;
  onToggleVideo: () => void;
}

const ControlsSection: React.FC<ControlsSectionProps> = ({
  isPlaying,
  station,
  isPrivilegedUser,
  listeners,
  showVideoPlayer,
  onPlayToggle,
  onBookShow,
  onToggleVideo
}) => {
  return (
    <>
      <StationControls
        isPlaying={isPlaying}
        listeners={listeners}
        isPrivilegedUser={isPrivilegedUser}
        onPlayToggle={onPlayToggle}
        onBookShow={onBookShow}
      />
      
      {/* Video Toggle Button */}
      <VideoToggle 
        isLive={station.isLive}
        hasVideoStream={!!station.videoStreamUrl}
        showVideoPlayer={showVideoPlayer}
        onToggleVideo={onToggleVideo}
      />
    </>
  );
};

export default ControlsSection;
