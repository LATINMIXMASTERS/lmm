
import { RefObject, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseVideoPlaybackProps {
  videoRef: RefObject<HTMLVideoElement>;
  streamUrl: string;
  isVisible: boolean;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
  hasError: boolean;
  setHasError: (hasError: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  shouldUseFallback: boolean;
  setShouldUseFallback: (shouldUseFallback: boolean) => void;
}

export function useVideoPlayback({
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
}: UseVideoPlaybackProps) {
  const { toast } = useToast();

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
  }, [isPlaying, isVisible, streamUrl, toast, hasError, setIsPlaying, setHasError, shouldUseFallback, setShouldUseFallback]);

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
  }, [isVisible, streamUrl, toast, hasError, setIsPlaying, setIsLoading, setHasError, shouldUseFallback, setShouldUseFallback]);

  // Enhanced togglePlay to handle errors
  const enhancedTogglePlay = (togglePlay: () => void) => {
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
    enhancedTogglePlay
  };
}
