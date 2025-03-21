
import React, { useRef, useEffect, MutableRefObject } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { setupMetadataPolling } from './audio-engine/metadata';

interface AudioEngineProps {
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  audioRef: MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: MutableRefObject<number | null>;
  stationInfo: {
    name: string;
    currentTrack: string;
    coverImage: string;
  };
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
  }>>;
  setIsTrackPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  setLikes: React.Dispatch<React.SetStateAction<number>>;
}

// Import the new refactored component
import AudioEngineComponent from './audio-engine';

const AudioEngine: React.FC<AudioEngineProps> = (props) => {
  // Simply pass all props to the refactored component
  return <AudioEngineComponent {...props} />;
};

export default AudioEngine;
