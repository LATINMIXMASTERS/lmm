
import { RefObject, useEffect } from 'react';

interface UseVideoEffectsProps {
  videoRef: RefObject<HTMLVideoElement>;
  volume: number;
  isMuted: boolean; 
}

export function useVideoEffects({ videoRef, volume, isMuted }: UseVideoEffectsProps) {
  // Handle volume and mute changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);
}
