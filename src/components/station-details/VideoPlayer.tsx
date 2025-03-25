
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import VideoPlayerControls from './VideoPlayerControls';
import VideoPlayerElement from './video-player/VideoPlayerElement';
import VideoPlayerLoading from './video-player/VideoPlayerLoading';
import VideoPlayerEmptyState from './video-player/VideoPlayerEmptyState';
import VideoPlayerFallback from './video-player/VideoPlayerFallback';
import VideoPlayerCloseButton from './video-player/VideoPlayerCloseButton';
import { useVideoPlayer } from '@/hooks/video-player';
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
  const [fallbackToIframe, setFallbackToIframe] = useState(false);
  const initialUrlCheck = useRef(false);
  
  // Check if the URL is likely to require the fallback player immediately
  useEffect(() => {
    if (streamUrl && !initialUrlCheck.current) {
      initialUrlCheck.current = true;
      
      // Known problematic domains that require direct iframe
      const problematicDomains = ['lmmappstore.com'];
      
      // Check if the URL contains any of the problematic domains
      const needsFallback = problematicDomains.some(domain => streamUrl.includes(domain));
      
      if (needsFallback) {
        console.log("Using fallback player immediately for known problematic domain");
        setFallbackToIframe(true);
      }
    }
  }, [streamUrl]);
  
  // Enhanced logging for debugging
  useEffect(() => {
    console.log("VideoPlayer component rendered with props:", { 
      streamUrl, 
      isVisible,
      embedded,
      streamUrlValid: !!streamUrl && streamUrl.length > 0,
      usingFallback: fallbackToIframe
    });
  }, [streamUrl, isVisible, embedded, fallbackToIframe]);
  
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
    shouldUseFallback,
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
    isVisible: isVisible && !fallbackToIframe // Only use native player if not falling back
  });

  // Update fallback state if the hook suggests we should use fallback
  useEffect(() => {
    if (shouldUseFallback && !fallbackToIframe) {
      console.log("Switching to fallback player based on hook recommendation");
      setFallbackToIframe(true);
    }
  }, [shouldUseFallback, fallbackToIframe]);

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
    setFallbackToIframe(true);
    
    // Show a helpful error message
    toast({
      title: "Switching to Compatible Player",
      description: "Using alternative player for better compatibility",
      variant: "default"
    });
  };

  const renderVideoContent = () => {
    if (fallbackToIframe) {
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
        <VideoPlayerCloseButton onClose={onClose} />
      </div>
    </div>
  );
};

export default VideoPlayer;
