
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
      
      // Double-check that normalized volume is within valid bounds
      const safeVolume = Math.max(0, Math.min(1, normalizedVolume));
      
      // Log for debugging
      console.log('Video volume set to:', safeVolume, 'from original value:', volume, 'muted:', isMuted);
      
      // Apply volume and mute settings
      videoRef.current.volume = isMuted ? 0 : safeVolume;
      videoRef.current.muted = isMuted;
    }
  }, [volume, isMuted, videoRef]);
}
