
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVideoPlayerProps {
  streamUrl: string;
  isVisible: boolean;
}

export function useVideoPlayer({ streamUrl, isVisible }: UseVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Log when component initializes with stream URL
  useEffect(() => {
    console.log("useVideoPlayer hook initialized with stream URL:", streamUrl);
    console.log("Video visibility:", isVisible);
    
    // Reset loading state when visibility changes
    if (isVisible) {
      setIsLoading(true);
      setHasError(false);
    }
  }, [isVisible, streamUrl]);

  // Handle play state updates
  useEffect(() => {
    if (videoRef.current && isVisible && !hasError) {
      if (isPlaying) {
        console.log("Attempting to play video with URL:", streamUrl);
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          setIsPlaying(false);
          setHasError(true);
          
          let errorMessage = "Could not play video stream.";
          if (err.name === "NotSupportedError") {
            errorMessage = "This stream format is not supported by your browser or may have CORS restrictions.";
          } else if (err.name === "NotAllowedError") {
            errorMessage = "Autoplay was blocked. Please interact with the player to start playback.";
          }
          
          toast({
            title: "Video Playback Error",
            description: errorMessage,
            variant: "destructive"
          });
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVisible, streamUrl, toast, hasError]);

  // Handle volume and mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Auto-play when video becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current && !hasError) {
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
      
      // Check if stream URL is a valid M3U8 file
      if (!streamUrl.toLowerCase().endsWith('.m3u8')) {
        console.warn("Stream URL doesn't end with .m3u8 extension, which may cause compatibility issues");
      }
      
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsPlaying(true);
          console.log("Video playback started successfully");
        }).catch(err => {
          console.error("Error auto-playing video:", err);
          setIsPlaying(false);
          setHasError(true);
          
          let errorMessage = "Could not auto-play the video.";
          if (err.name === "NotSupportedError") {
            errorMessage = "This stream format is not supported by your browser or may have CORS restrictions.";
          } else if (err.name === "NotAllowedError") {
            errorMessage = "Autoplay was blocked. Please click the play button to start.";
          }
          
          toast({
            title: "Video Playback Error",
            description: errorMessage,
            variant: "destructive"
          });
        });
      }
    }
  }, [isVisible, streamUrl, toast, hasError]);

  // Monitor fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const togglePlay = () => {
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
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && containerRef.current) {
      containerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error("Error attempting to enable fullscreen:", err);
      });
    } else if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error("Error attempting to exit fullscreen:", err);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleDurationChange = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handleLoadStart = () => {
    console.log("Video load started");
    setIsLoading(true);
  };

  const handleCanPlay = () => {
    console.log("Video can play now");
    setIsLoading(false);
    setHasError(false);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
    togglePlay,
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
