
import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import Hls from 'hls.js';
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
  const hlsRef = useRef<Hls | null>(null);
  
  const safeStreamUrl = streamUrl || '';
  
  // Check if the browser supports native HLS
  const supportsNativeHLS = useRef(() => {
    const video = document.createElement('video');
    return video.canPlayType('application/vnd.apple.mpegurl') !== '';
  }).current();
  
  useEffect(() => {
    if (!isVisible) return;
    
    if (safeStreamUrl && !initialUrlCheck.current) {
      initialUrlCheck.current = true;
      
      const problematicDomains = ['lmmappstore.com'];
      const needsFallback = problematicDomains.some(domain => safeStreamUrl.includes(domain));
      
      // Always use fallback for m3u8 on mobile devices
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isM3u8 = safeStreamUrl.toLowerCase().endsWith('.m3u8');
      
      if (needsFallback || (isMobile && isM3u8 && !supportsNativeHLS)) {
        console.log("Using fallback player for compatibility");
        setFallbackToIframe(true);
      }
    }
  }, [safeStreamUrl, isVisible, supportsNativeHLS]);
  
  useEffect(() => {
    console.log("VideoPlayer component rendered:", { 
      streamUrl: safeStreamUrl, 
      isVisible,
      embedded,
      usingFallback: fallbackToIframe,
      supportsNativeHLS
    });
  }, [safeStreamUrl, isVisible, embedded, fallbackToIframe, supportsNativeHLS]);
  
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

  // Use Hls.js for non-Safari browsers when not using the fallback player
  useEffect(() => {
    if (fallbackToIframe || !videoRef.current || !isVisible || !safeStreamUrl || !safeStreamUrl.endsWith('.m3u8')) {
      return;
    }
    
    // If HLS.js is supported and it's an m3u8 stream
    if (Hls.isSupported()) {
      // Clean up any existing instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      
      try {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          fragLoadingMaxRetry: 5
        });
        
        hlsRef.current = hls;
        hls.loadSource(safeStreamUrl);
        hls.attachMedia(videoRef.current);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (isPlaying && videoRef.current) {
            videoRef.current.play().catch(e => {
              console.error("Error auto-playing video:", e);
              setErrorCount(prev => prev + 1);
            });
          }
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          console.error("HLS error:", data);
          setErrorCount(prev => prev + 1);
          
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.log("Fatal network error, trying to recover");
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log("Fatal media error, trying to recover");
                hls.recoverMediaError();
                break;
              default:
                console.log("Fatal error, using fallback");
                hls.destroy();
                setFallbackToIframe(true);
                break;
            }
          }
        });
      } catch (error) {
        console.error("Error initializing HLS:", error);
        setFallbackToIframe(true);
      }
    } else if (!supportsNativeHLS) {
      // Browser doesn't support HLS.js or native HLS
      setFallbackToIframe(true);
    }
    
    return () => {
      if (hlsRef.current) {
        console.log("Destroying HLS instance");
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isVisible, safeStreamUrl, isPlaying, supportsNativeHLS]);

  useEffect(() => {
    if (shouldUseFallback && !fallbackToIframe) {
      console.log("Switching to fallback player based on hook recommendation");
      setFallbackToIframe(true);
    }
  }, [shouldUseFallback, fallbackToIframe]);

  // Handle fallback after multiple errors
  useEffect(() => {
    if (errorCount >= 2 && !fallbackToIframe) {
      console.log("Multiple errors detected, switching to fallback player");
      setFallbackToIframe(true);
      toast({
        title: "Switching to Compatible Player",
        description: "Using alternative player for better compatibility"
      });
    }
  }, [errorCount, fallbackToIframe, toast]);

  if (!isVisible) {
    return null;
  }

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.error("Video error:", e);
    setErrorCount(prev => prev + 1);
    
    if (errorCount >= 1 && !fallbackToIframe) {
      setFallbackToIframe(true);
      toast({
        title: "Switching to Compatible Player",
        description: "Using alternative player for better compatibility"
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
