
import React from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/utils/formatTime';
import VolumeControl from './VolumeControl';

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
  // Make sure volume is within 0-100 range for the volume control slider
  const displayVolume = Math.min(100, Math.max(0, volume));
  
  return (
    <div className="flex items-center space-x-6">
      <div className="hidden md:block">
        <VolumeControl
          volume={displayVolume}
          isMuted={isMuted}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          showLabel={true}
        />
      </div>
      
      <button
        onClick={togglePlayPause}
        className="w-12 h-12 rounded-full bg-gold text-black flex items-center justify-center hover:bg-gold-dark transition-colors duration-300 shadow-sm"
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
            className="h-1 w-24 accent-gold"
            style={{ accentColor: '#FFD700' }}
          />
          <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
        </div>
      )}
    </div>
  );
};

export default PlaybackControls;
