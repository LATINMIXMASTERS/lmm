
import React, { useEffect } from 'react';
import StationControls from '@/components/station-details/StationControls';

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
  // Log for debugging purposes
  useEffect(() => {
    console.log("ControlsSection rendering with props:", {
      stationId: station?.id,
      isLive: station?.isLive,
      hasVideoStream: !!station?.videoStreamUrl,
      showVideoPlayer,
      videoStreamUrl: station?.videoStreamUrl
    });
  }, [station, showVideoPlayer]);

  return (
    <StationControls
      isPlaying={isPlaying}
      listeners={listeners}
      isPrivilegedUser={isPrivilegedUser}
      onPlayToggle={onPlayToggle}
      onBookShow={onBookShow}
    />
  );
};

export default ControlsSection;
