
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
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);
};
