
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVideoControls } from './useVideoControls';
import { useVideoEvents } from './useVideoEvents';
import { UseVideoPlayerProps } from './types';

export function useVideoPlayer({ streamUrl, isVisible }: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  
  // Get video controls and events from our custom hooks
  const {
    isPlaying,
    setIsPlaying,
    volume, 
    isMuted,
    isFullscreen,
    containerRef,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    formatTime
  } = useVideoControls(videoRef);
  
  const {
    currentTime,
    duration,
    isLoading,
    setIsLoading,
    hasError,
    setHasError,
    handleTimeUpdate,
    handleDurationChange,
    handleLoadStart,
    handleCanPlay
  } = useVideoEvents(videoRef);

  // Track if we should recommend using the fallback player
  const [shouldUseFallback, setShouldUseFallback] = useState(false);

  // Check for known problematic stream formats
  useEffect(() => {
    if (streamUrl) {
      // Known problematic domains or URL patterns that need special handling
      const problematicPatterns = [
        'lmmappstore.com',
        '.m3u8'  // Many m3u8 streams have CORS or format compatibility issues
      ];
      
      // Check if URL matches any problematic patterns
      const needsSpecialHandling = problematicPatterns.some(pattern => 
        streamUrl.toLowerCase().includes(pattern)
      );
      
      if (needsSpecialHandling) {
        console.log("Stream URL may require special handling:", streamUrl);
        setShouldUseFallback(true);
      }
    }
  }, [streamUrl]);

  // Log when component initializes with stream URL
  useEffect(() => {
    console.log("useVideoPlayer hook initialized with stream URL:", streamUrl);
    console.log("Video visibility:", isVisible);
    console.log("Should use fallback:", shouldUseFallback);
    
    // Reset loading state when visibility changes
    if (isVisible) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isVisible, streamUrl, setIsLoading, setHasError, shouldUseFallback]);

  // Handle play state updates
  useEffect(() => {
    if (videoRef.current && isVisible && !hasError && !shouldUseFallback) {
      if (isPlaying) {
        console.log("Attempting to play video with URL:", streamUrl);
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          setIsPlaying(false);
          setHasError(true);
          setShouldUseFallback(true);
          
          let errorMessage = "Could not play video stream. Trying alternative player...";
          if (err.name === "NotSupportedError") {
            errorMessage = "This stream format is not supported by your browser. Trying alternative player...";
          } else if (err.name === "NotAllowedError") {
            errorMessage = "Autoplay was blocked. Please interact with the player to start playback.";
          }
          
          toast({
            title: "Switching to Compatible Player",
            description: errorMessage,
            variant: "default"
          });
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVisible, streamUrl, toast, hasError, setIsPlaying, setHasError, shouldUseFallback]);

  // Handle volume and mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Auto-play when video becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current && !hasError && !shouldUseFallback) {
      console.log("Video becoming visible, loading source:", streamUrl);
      // Ensure we have a valid stream URL
      if (!streamUrl) {
        console.error("No stream URL provided");
        setIsLoading(false);
        setHasError(true);
        toast({
          title: "No video stream available",
          description: "The station doesn't have a valid video stream URL",
          variant: "destructive"
        });
        return;
      }
      
      setIsLoading(true);
      videoRef.current.load();
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          console.log("Video playback started successfully");
        }).catch(err => {
          console.error("Error auto-playing video:", err);
          setIsPlaying(false);
          setHasError(true);
          setShouldUseFallback(true);
          
          let errorMessage = "Could not auto-play the video. Trying alternative player...";
          if (err.name === "NotSupportedError") {
            errorMessage = "This stream format is not supported by your browser. Trying alternative player...";
          } else if (err.name === "NotAllowedError") {
            errorMessage = "Autoplay was blocked. Please click the play button to start.";
          }
          
          toast({
            title: "Switching to Compatible Player",
            description: errorMessage,
            variant: "default"
          });
        });
      }
    }
  }, [isVisible, streamUrl, toast, hasError, setIsPlaying, setIsLoading, setHasError, shouldUseFallback]);

  // Modified togglePlay to handle errors
  const enhancedTogglePlay = () => {
    if (hasError) {
      setHasError(false);
      setIsLoading(true);
      
      // Try reloading the video
      if (videoRef.current) {
        videoRef.current.load();
        videoRef.current.play().then(() => {
          setIsPlaying(true);
        }).catch(err => {
          console.error("Error retrying video playback:", err);
          setIsPlaying(false);
          setHasError(true);
          setShouldUseFallback(true);
          
          toast({
            title: "Switching to Compatible Player",
            description: "Using alternative player for better compatibility",
            variant: "default"
          });
        });
      }
    } else {
      togglePlay();
    }
  };

  return {
    videoRef,
    containerRef,
    isPlaying,
    isLoading,
    volume,
    isMuted,
    isFullscreen,
    currentTime,
    duration,
    hasError,
    shouldUseFallback,
    togglePlay: enhancedTogglePlay,
    toggleMute,
    toggleFullscreen,
    handleTimeUpdate,
    handleDurationChange,
    handleVolumeChange,
    handleLoadStart,
    handleCanPlay,
    formatTime
  };
}
