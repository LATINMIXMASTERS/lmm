
import { useEffect } from 'react';
import { applyVolumeToElement } from '@/utils/audioUtils';

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
    // Make sure volume is normalized to 0-1 range before applying
    applyVolumeToElement(audioRef.current, volume, isMuted);
  }, [volume, isMuted, audioRef]);
};
