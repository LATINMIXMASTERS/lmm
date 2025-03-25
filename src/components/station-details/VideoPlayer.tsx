
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VideoPlayerControls from './VideoPlayerControls';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  streamUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl, isVisible, onClose }) => {
  const { toast } = useToast();
  
  // Log props for debugging
  useEffect(() => {
    console.log("VideoPlayer props:", { streamUrl, isVisible });
  }, [streamUrl, isVisible]);
  
  const {
    videoRef,
    containerRef,
    isPlaying,
    volume,
    isMuted,
    isFullscreen,
    currentTime,
    duration,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleTimeUpdate,
    handleDurationChange,
    handleVolumeChange,
    formatTime
  } = useVideoPlayer({
    streamUrl,
    isVisible
  });

  // Don't render anything if not visible
  if (!isVisible) return null;
  
  // Don't render if no stream URL
  if (!streamUrl) {
    console.error("VideoPlayer: No stream URL provided");
    toast({
      title: "Video Error",
      description: "No video stream URL available",
      variant: "destructive"
    });
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed bottom-20 left-0 right-0 mx-auto max-w-3xl bg-black z-50 rounded-lg overflow-hidden shadow-xl",
        isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "max-h-[40vh]"
      )}
    >
      <div className="relative">
        <video 
          ref={videoRef}
          className="w-full h-full"
          src={streamUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onError={(e) => {
            console.error("Video error:", e);
            toast({
              title: "Video Error",
              description: "There was an error playing this video stream",
              variant: "destructive"
            });
          }}
        >
          Your browser does not support HTML5 video.
        </video>
        
        <div className="absolute top-0 right-0 p-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white bg-black/50 hover:bg-black/70 h-8 w-8 rounded-full"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <VideoPlayerControls 
          isPlaying={isPlaying}
          isMuted={isMuted}
          isFullscreen={isFullscreen}
          volume={volume}
          currentTime={currentTime}
          duration={duration}
          togglePlay={togglePlay}
          toggleMute={toggleMute}
          toggleFullscreen={toggleFullscreen}
          handleVolumeChange={handleVolumeChange}
          formatTime={formatTime}
        />
      </div>
    </div>
  );
};

export default VideoPlayer;
