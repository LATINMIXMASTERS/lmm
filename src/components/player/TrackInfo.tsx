
import React from 'react';
import { Radio, Music } from 'lucide-react';
import { formatDuration } from '@/utils/formatTime';

interface TrackInfoProps {
  stationInfo: {
    name: string;
    currentTrack: string;
    coverImage: string;
  };
  isTrackPlaying: boolean;
  currentTime: number;
  duration: number;
  handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsExpanded: (value: boolean) => void;
  isExpanded: boolean;
}

const TrackInfo: React.FC<TrackInfoProps> = ({
  stationInfo,
  isTrackPlaying,
  currentTime,
  duration,
  handleProgressChange,
  setIsExpanded,
  isExpanded
}) => {
  return (
    <div className="flex items-center space-x-3 flex-1 min-w-0">
      <div 
        className="w-12 h-12 rounded-md bg-gray-lightest overflow-hidden flex-shrink-0 relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img 
          src={stationInfo.coverImage} 
          alt={stationInfo.name}
          className="w-full h-full object-cover transition-all duration-400"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
          {isTrackPlaying ? (
            <Music className="w-5 h-5 text-white" />
          ) : (
            <Radio className="w-5 h-5 text-white" />
          )}
        </div>
      </div>
      
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-black truncate">{stationInfo.name}</h4>
        <p className="text-xs text-gray truncate">{stationInfo.currentTrack}</p>
        
        {/* Track progress bar (only shown for tracks, not radio streams) */}
        {isTrackPlaying && duration > 0 && (
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-xs text-gray-500">{formatDuration(currentTime)}</span>
            <input 
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleProgressChange}
              className="h-1 flex-1 accent-blue"
            />
            <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackInfo;
