
import { useState, useRef, RefObject } from 'react';
import { useToast } from '@/hooks/use-toast';
import { normalizeVolume } from '@/utils/audioUtils';

export function useVideoControls(videoRef: RefObject<HTMLVideoElement>) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7); // Default volume (0-1 scale)
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Toggle play/pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.error("Error playing video:", err);
        setIsPlaying(false);
        
        let errorMessage = "Could not play video stream.";
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
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Toggle fullscreen
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

  // Handle volume change from slider
  const handleVolumeChange = (value: number[]) => {
    if (value.length > 0) {
      // Always normalize volume to ensure it's in the 0-1 range
      const normalizedValue = normalizeVolume(value[0]);
      console.log('Video volume set via slider:', normalizedValue);
      
      setVolume(normalizedValue);
      if (normalizedValue === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  // Format time (mm:ss)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    isPlaying,
    setIsPlaying,
    volume,
    setVolume,
    isMuted,
    setIsMuted,
    isFullscreen,
    setIsFullscreen,
    containerRef,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    formatTime
  };
}
