
import React from 'react';
import { Video } from 'lucide-react';
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
        variant="outline" 
        onClick={onToggleVideo}
        className={showVideoPlayer ? "bg-primary text-primary-foreground" : ""}
      >
        <Video className="mr-2 h-4 w-4" />
        {showVideoPlayer ? "Hide Video" : "Show Video Stream"}
      </Button>
    </div>
  );
};

export default VideoToggle;
