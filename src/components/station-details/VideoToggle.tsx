
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
    
    // Even if there's no video stream, try to toggle - the host might have just added one
    onToggleVideo();
    
    // Show toast based on new state
    if (!showVideoPlayer) {
      toast({
        title: "Video Stream Enabled",
        description: hasVideoStream ? "Loading video stream..." : "No video stream URL configured. Please add a stream URL in your dashboard.",
      });
    }
  };
  
  return (
    <div className="mt-4 flex justify-center">
      <Button 
        variant={showVideoPlayer ? "default" : "outline"}
        onClick={handleToggleClick}
        className="flex items-center gap-2 relative"
      >
        {showVideoPlayer ? (
          <>
            <VideoOff className="h-4 w-4" />
            Hide Video Stream
          </>
        ) : (
          <>
            <Video className="h-4 w-4" />
            Show Video Stream
          </>
        )}
        
        {/* Add a status indicator dot */}
        {isLive && hasVideoStream && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-green-500 transform translate-x-1 -translate-y-1" />
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
