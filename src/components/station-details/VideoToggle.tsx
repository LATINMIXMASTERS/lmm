
import React from 'react';
import { Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoToggleProps {
  isLive: boolean;
  hasVideoStream: boolean;
  showVideoPlayer: boolean;
  onToggleVideo: () => void;
}

const VideoToggle: React.FC<VideoToggleProps> = ({ 
  isLive, 
  hasVideoStream, 
  showVideoPlayer, 
  onToggleVideo 
}) => {
  // Only show the toggle if the station is live and has a video stream configured
  if (!isLive || !hasVideoStream) return null;
  
  return (
    <div className="mt-4 flex justify-center">
      <Button 
        variant={showVideoPlayer ? "default" : "outline"}
        onClick={onToggleVideo}
        className="flex items-center gap-2"
      >
        {showVideoPlayer ? (
          <>
            <VideoOff className="h-4 w-4" />
            Hide Video
          </>
        ) : (
          <>
            <Video className="h-4 w-4" />
            Show Video Stream
          </>
        )}
      </Button>
    </div>
  );
};

export default VideoToggle;
