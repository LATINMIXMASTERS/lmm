
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
    // Use utility function to safely apply volume
    applyVolumeToElement(audioRef.current, volume, isMuted);
  }, [volume, isMuted, audioRef]);
};
