
export interface VideoPlayerState {
  isPlaying: boolean;
  isLoading: boolean;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  hasError: boolean;
}

export interface UseVideoPlayerProps {
  streamUrl: string;
  isVisible: boolean;
}
