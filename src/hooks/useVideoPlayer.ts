
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
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Log when component initializes with stream URL
  useEffect(() => {
    console.log("useVideoPlayer hook initialized with stream URL:", streamUrl);
    console.log("Video visibility:", isVisible);
    
    // Reset loading state when visibility changes
    if (isVisible) {
      setIsLoading(true);
    }
  }, [isVisible, streamUrl]);

  // Handle play state updates
  useEffect(() => {
    if (videoRef.current && isVisible) {
      if (isPlaying) {
        console.log("Attempting to play video with URL:", streamUrl);
        videoRef.current.play().catch(err => {
          console.error("Error playing video:", err);
          setIsPlaying(false);
          toast({
            title: "Video Playback Error",
            description: `Could not play video: ${err.message}`,
            variant: "destructive"
          });
        });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying, isVisible, streamUrl, toast]);

  // Handle volume and mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Auto-play when video becomes visible
  useEffect(() => {
    if (isVisible && videoRef.current) {
      console.log("Video becoming visible, loading source:", streamUrl);
      // Ensure we have a valid stream URL
      if (!streamUrl) {
        console.error("No stream URL provided");
        setIsLoading(false);
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
          toast({
            title: "Video Playback Error",
            description: `Could not auto-play video: ${err.message}`,
            variant: "destructive"
          });
        });
      }
    }
  }, [isVisible, streamUrl, toast]);

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
    setIsPlaying(!isPlaying);
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
