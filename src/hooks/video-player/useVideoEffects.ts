
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
      // Ensure volume is within the valid range (0-1)
      // If volume is provided in 0-100 range, normalize it to 0-1
      const normalizedVolume = volume > 1 ? volume / 100 : volume;
      videoRef.current.volume = normalizedVolume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);
}
