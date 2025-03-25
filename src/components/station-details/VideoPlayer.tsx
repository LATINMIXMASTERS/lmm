
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import VideoPlayerControls from './VideoPlayerControls';
import VideoPlayerElement from './video-player/VideoPlayerElement';
import VideoPlayerLoading from './video-player/VideoPlayerLoading';
import VideoPlayerEmptyState from './video-player/VideoPlayerEmptyState';
import VideoPlayerFallback from './video-player/VideoPlayerFallback';
import VideoPlayerCloseButton from './video-player/VideoPlayerCloseButton';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';
import { useToast } from '@/hooks/use-toast';

interface VideoPlayerProps {
  streamUrl: string;
  isVisible: boolean;
  onClose: () => void;
  embedded?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  streamUrl, 
  isVisible, 
  onClose,
  embedded = false 
}) => {
  const { toast } = useToast();
  const fallbackToIframe = useRef(false);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("VideoPlayer component rendered with props:", { 
      streamUrl, 
      isVisible,
      embedded,
      streamUrlValid: !!streamUrl && streamUrl.length > 0 
    });
  }, [streamUrl, isVisible, embedded]);
  
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

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
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
    
    // Set our fallback flag to true
    fallbackToIframe.current = true;
    
    // Show a helpful error message
    let userMessage = "Could not play video stream.";
    
    if (errorCode === 4) {
      userMessage = "This stream format is not supported or may have CORS restrictions. Trying alternative player...";
    } else if (errorCode === 2) {
      userMessage = "Network error while loading the stream.";
    }
    
    toast({
      title: "Video Stream Issue",
      description: userMessage,
      variant: "destructive"
    });
  };

  const renderVideoContent = () => {
    if (fallbackToIframe.current) {
      return <VideoPlayerFallback streamUrl={streamUrl} isVisible={isVisible} />;
    }
    
    return (
      <>
        {isLoading && <VideoPlayerLoading />}
        {!streamUrl && <VideoPlayerEmptyState embedded={embedded} />}
        
        <VideoPlayerElement
          videoRef={videoRef}
          streamUrl={streamUrl}
          onTimeUpdate={handleTimeUpdate}
          onDurationChange={handleDurationChange}
          onLoadStart={handleLoadStart}
          onCanPlay={handleCanPlay}
          onError={handleVideoError}
        />
        
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
      </>
    );
  };

  if (embedded) {
    return (
      <div 
        ref={containerRef}
        className="w-full relative aspect-video bg-black"
      >
        {renderVideoContent()}
      </div>
    );
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
        {renderVideoContent()}
        
        {!fallbackToIframe.current && <VideoPlayerCloseButton onClose={onClose} />}
        {fallbackToIframe.current && <VideoPlayerCloseButton onClose={onClose} />}
      </div>
    </div>
  );
};

export default VideoPlayer;
