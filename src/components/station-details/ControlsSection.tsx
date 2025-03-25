
import React, { useEffect } from 'react';
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
    <>
      <StationControls
        isPlaying={isPlaying}
        listeners={listeners}
        isPrivilegedUser={isPrivilegedUser}
        onPlayToggle={onPlayToggle}
        onBookShow={onBookShow}
      />
      
      {/* Video Toggle Button - always render for better discoverability */}
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-medium text-center mb-2">Video Stream</h3>
        <VideoToggle 
          isLive={station?.isLive || false}
          hasVideoStream={!!station?.videoStreamUrl}
          showVideoPlayer={showVideoPlayer}
          onToggleVideo={onToggleVideo}
        />
      </div>
    </>
  );
};

export default ControlsSection;
