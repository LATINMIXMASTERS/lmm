
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
      
      {/* Video Toggle Button - always render for debugging */}
      <div className="mt-4 border-t pt-4">
        <h3 className="text-sm font-medium text-center mb-2">Video Stream</h3>
        <VideoToggle 
          isLive={station?.isLive || false}
          hasVideoStream={!!station?.videoStreamUrl}
          showVideoPlayer={showVideoPlayer}
          onToggleVideo={onToggleVideo}
        />
        
        {/* Debug info - remove in production */}
        <div className="mt-2 text-xs text-muted-foreground text-center">
          Station Live: {station?.isLive ? 'Yes' : 'No'} | 
          Has Video: {!!station?.videoStreamUrl ? 'Yes' : 'No'} |
          Video URL: {station?.videoStreamUrl ? 
            (station.videoStreamUrl.length > 20 ? 
              `${station.videoStreamUrl.substring(0, 20)}...` : 
              station.videoStreamUrl) : 
            'None'}
        </div>
      </div>
    </>
  );
};

export default ControlsSection;
