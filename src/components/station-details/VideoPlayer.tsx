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
  const [errorCount, setErrorCount] = useState(0);
  
  const safeStreamUrl = streamUrl || '';
  
  useEffect(() => {
    if (!isVisible) return;
    
    if (safeStreamUrl && !initialUrlCheck.current) {
      initialUrlCheck.current = true;
      
      const problematicDomains = ['lmmappstore.com'];
      
      const needsFallback = problematicDomains.some(domain => safeStreamUrl.includes(domain));
      
      if (needsFallback) {
        console.log("Using fallback player immediately for known problematic domain");
        setFallbackToIframe(true);
      }
    }
  }, [safeStreamUrl, isVisible]);
  
  useEffect(() => {
    if (!isVisible) return;
    
    console.log("VideoPlayer component rendered with props:", { 
      streamUrl: safeStreamUrl, 
      isVisible,
      embedded,
      streamUrlValid: !!safeStreamUrl && safeStreamUrl.length > 0,
      usingFallback: fallbackToIframe
    });
  }, [safeStreamUrl, isVisible, embedded, fallbackToIframe]);
  
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
    streamUrl: safeStreamUrl,
    isVisible: isVisible && !fallbackToIframe
  });

  useEffect(() => {
    if (shouldUseFallback && !fallbackToIframe) {
      console.log("Switching to fallback player based on hook recommendation");
      setFallbackToIframe(true);
    }
  }, [shouldUseFallback, fallbackToIframe]);

  if (!isVisible) {
    return null;
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video error:", e);
    const videoElement = e.currentTarget;
    const errorCode = videoElement.error ? videoElement.error.code : 'unknown';
    const errorMessage = videoElement.error ? videoElement.error.message : 'Unknown error';
    
    console.error("Video error details:", { 
      errorCode, 
      errorMessage,
      networkState: videoElement.networkState,
      readyState: videoElement.readyState,
      streamUrl: safeStreamUrl
    });
    
    setErrorCount(prev => prev + 1);
    
    if (errorCount >= 2 && !fallbackToIframe) {
      setFallbackToIframe(true);
      
      toast({
        title: "Switching to Compatible Player",
        description: "Using alternative player for better compatibility",
        variant: "default"
      });
    }
  };

  const renderVideoContent = () => {
    if (!safeStreamUrl) {
      return <VideoPlayerEmptyState embedded={embedded} />;
    }
    
    if (fallbackToIframe) {
      return <VideoPlayerFallback streamUrl={safeStreamUrl} isVisible={isVisible} />;
    }
    
    return (
      <>
        {isLoading && <VideoPlayerLoading />}
        
        <VideoPlayerElement
          videoRef={videoRef}
          streamUrl={safeStreamUrl}
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
