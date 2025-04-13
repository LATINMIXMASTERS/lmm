
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
      audioRef.current.volume = isMuted ? 0 : normalizedVolume;
    }
  }, [volume, isMuted, audioRef]);
};
