
import { useEffect } from 'react';

interface UseVolumeEffectProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  volume: number;
  isMuted: boolean;
}

export const useVolumeEffect = ({
  audioRef,
  volume,
  isMuted
}: UseVolumeEffectProps) => {
  useEffect(() => {
    if (audioRef.current) {
      // Ensure volume is always in the 0-1 range
      // Convert volume from 0-100 range to 0-1 range
      const normalizedVolume = volume > 1 ? volume / 100 : volume;
      
      // Double-check that normalized volume is within valid bounds
      const safeVolume = Math.max(0, Math.min(1, normalizedVolume));
      
      // Log for debugging
      console.log('Audio volume set to:', safeVolume, 'from original value:', volume, 'muted:', isMuted);
      
      audioRef.current.volume = isMuted ? 0 : safeVolume;
      
      // Also ensure muted state is correctly set
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted, audioRef]);
};
