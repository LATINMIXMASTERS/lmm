
import React from 'react';
import { Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  
  // Always show the toggle now for debugging purposes, we'll comment the condition
  // if (!isLive || !hasVideoStream) return null;
  
  const handleToggleClick = () => {
    // Log the current state for debugging
    console.log("Video toggle clicked. Current state:", { isLive, hasVideoStream, showVideoPlayer });
    
    if (!isLive) {
      toast({
        title: "Station Not Live",
        description: "The video stream is only available when the station is live",
        variant: "destructive"
      });
      return;
    }
    
    if (!hasVideoStream) {
      toast({
        title: "No Video Stream",
        description: "This station doesn't have a video stream configured",
        variant: "destructive"
      });
      return;
    }
    
    onToggleVideo();
  };
  
  // Determine if the button should be disabled
  const isDisabled = !isLive || !hasVideoStream;
  
  return (
    <div className="mt-4 flex justify-center">
      <Button 
        variant={showVideoPlayer ? "default" : "outline"}
        onClick={handleToggleClick}
        className="flex items-center gap-2"
        disabled={isDisabled}
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
      
      {/* Display status information for clarity */}
      {!isLive && (
        <div className="ml-2 text-xs text-muted-foreground flex items-center">
          (Station is offline)
        </div>
      )}
      {isLive && !hasVideoStream && (
        <div className="ml-2 text-xs text-muted-foreground flex items-center">
          (No video stream)
        </div>
      )}
    </div>
  );
};

export default VideoToggle;
