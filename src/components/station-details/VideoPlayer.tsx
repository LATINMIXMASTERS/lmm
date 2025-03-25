
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import VideoPlayerControls from './VideoPlayerControls';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useToast } from '@/hooks/use-toast';
import { Spinner } from '@/components/ui/spinner';

interface VideoPlayerProps {
  streamUrl: string;
  isVisible: boolean;
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ streamUrl, isVisible, onClose }) => {
  const { toast } = useToast();
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("VideoPlayer component rendered with props:", { 
      streamUrl, 
      isVisible, 
      streamUrlValid: !!streamUrl && streamUrl.length > 0 
    });
  }, [streamUrl, isVisible]);
  
  const {
    videoRef,
    containerRef,
    isPlaying,
    isLoading,
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
    formatTime,
    handleLoadStart,
    handleCanPlay
  } = useVideoPlayer({
    streamUrl,
    isVisible
  });

  // Don't render anything if not visible
  if (!isVisible) {
    console.log("VideoPlayer not rendering because isVisible is false");
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "fixed bottom-20 left-0 right-0 mx-auto max-w-3xl bg-black z-50 rounded-lg overflow-hidden shadow-xl border-2 border-primary",
        isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "max-h-[40vh]"
      )}
    >
      <div className="relative">
        {/* Display a loading spinner while the video is loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
            <div className="text-center">
              <Spinner className="mx-auto mb-2" />
              <p className="text-white text-sm">Loading video stream...</p>
            </div>
          </div>
        )}
        
        {/* No stream URL message */}
        {!streamUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 z-10">
            <div className="text-center p-4">
              <p className="text-white mb-2">No video stream URL configured</p>
              <p className="text-gray-400 text-sm">
                Radio hosts can add a stream URL in the host dashboard
              </p>
            </div>
          </div>
        )}
        
        <video 
          ref={videoRef}
          className="w-full h-full"
          src={streamUrl}
          playsInline
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={(e) => {
            console.error("Video error:", e);
            // Get more details about the error
            const videoElement = e.currentTarget;
            const errorCode = videoElement.error ? videoElement.error.code : 'unknown';
            const errorMessage = videoElement.error ? videoElement.error.message : 'Unknown error';
            
            console.error("Video error details:", { 
              errorCode, 
              errorMessage,
              networkState: videoElement.networkState,
              readyState: videoElement.readyState,
              streamUrl
            });
            
            toast({
              title: "Video Error",
              description: `Error playing video: ${errorMessage} (code: ${errorCode})`,
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
