
import { MutableRefObject } from 'react';

export interface AudioEngineProps {
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
