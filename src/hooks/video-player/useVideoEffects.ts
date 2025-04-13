
import { RefObject, useEffect } from 'react';
import { applyVolumeToElement } from '@/utils/audioUtils';

interface UseVideoEffectsProps {
  videoRef: RefObject<HTMLVideoElement>;
  volume: number;
  isMuted: boolean; 
}

export function useVideoEffects({ videoRef, volume, isMuted }: UseVideoEffectsProps) {
  // Handle volume and mute changes
  useEffect(() => {
    console.log('useVideoEffects - applying volume:', { volume, isMuted });
    // Use utility function to safely apply volume
    applyVolumeToElement(videoRef.current, volume, isMuted);
  }, [volume, isMuted, videoRef]);
}
