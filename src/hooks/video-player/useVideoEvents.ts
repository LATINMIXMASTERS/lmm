
import { useState, useEffect, RefObject } from 'react';

export function useVideoEvents(videoRef: RefObject<HTMLVideoElement>) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      // This is just a placeholder - we'll handle fullscreen state in useVideoControls
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Time update handler
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  // Duration change handler
  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Load start handler
  const handleLoadStart = () => {
    console.log("Video load started");
    setIsLoading(true);
  };

  // Can play handler
  const handleCanPlay = () => {
    console.log("Video can play now");
    setIsLoading(false);
    setHasError(false);
  };

  return {
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
  };
}
