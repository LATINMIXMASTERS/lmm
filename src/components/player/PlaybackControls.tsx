
import React from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/formatTime';

interface PlaybackControlsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  volume: number;
  isMuted: boolean;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isTrackPlaying: boolean;
}

const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  togglePlayPause,
  volume,
  isMuted,
  handleVolumeChange,
  toggleMute,
  currentTime,
  duration,
  handleProgressChange,
  isTrackPlaying
}) => {
  return (
    <div className="flex items-center space-x-6">
      <div className="hidden md:flex items-center space-x-2">
        <button
          onClick={toggleMute}
          className="text-gray hover:text-black transition-colors duration-300"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={handleVolumeChange}
          className="w-24 accent-blue"
          aria-label="Volume control"
        />
      </div>
      
      <button
        onClick={togglePlayPause}
        className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center hover:bg-blue-dark transition-colors duration-300 shadow-sm"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" />
        ) : (
          <Play className="w-5 h-5 ml-0.5" />
        )}
      </button>
      
      {isTrackPlaying && duration > 0 && (
        <div className="hidden md:flex items-center space-x-2">
          <span className="text-xs text-gray-500">{formatDuration(currentTime)}</span>
          <input 
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={handleProgressChange}
            className="h-1 w-24 accent-blue"
          />
          <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  );
};

export default PlaybackControls;
