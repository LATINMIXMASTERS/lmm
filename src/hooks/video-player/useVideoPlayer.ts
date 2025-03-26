
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useVideoControls } from './useVideoControls';
import { useVideoEvents } from './useVideoEvents';
import { useStreamCompatibility } from './useStreamCompatibility';
import { useVideoPlayback } from './useVideoPlayback';
import { useVideoEffects } from './useVideoEffects';
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

  // Use our new compatibility hook
  const {
    shouldUseFallback,
    setShouldUseFallback
  } = useStreamCompatibility(streamUrl);

  // Use our new playback hook
  const { enhancedTogglePlay } = useVideoPlayback({
    videoRef,
    streamUrl,
    isVisible,
    isPlaying,
    setIsPlaying,
    hasError,
    setHasError,
    setIsLoading,
    shouldUseFallback,
    setShouldUseFallback
  });

  // Use our new effects hook
  useVideoEffects({
    videoRef,
    volume,
    isMuted
  });

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
    togglePlay: () => enhancedTogglePlay(togglePlay),
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
