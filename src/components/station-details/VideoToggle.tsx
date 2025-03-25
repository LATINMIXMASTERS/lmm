
import React, { useState } from 'react';
import { Video, VideoOff, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [hasAttempted, setHasAttempted] = useState(false);
  
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
    
    // Set that we've attempted to use the video player
    setHasAttempted(true);
    
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
    <div className="mt-4 flex justify-center items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant={showVideoPlayer ? "default" : "outline"}
              onClick={handleToggleClick}
              className="flex items-center gap-2 relative"
              disabled={!isLive}
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
          </TooltipTrigger>
          <TooltipContent>
            {!isLive ? "Station must be live to enable video" : 
             (hasVideoStream ? "Video stream is available" : "No video stream URL configured")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {/* Display status information for clarity */}
      {hasAttempted && hasVideoStream && !showVideoPlayer && (
        <div className="ml-2 flex items-center text-yellow-600 text-xs">
          <AlertCircle className="h-3 w-3 mr-1" />
          If the stream doesn't load, check that it's a compatible format
        </div>
      )}
      
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
