
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatVolumeForDisplay } from '@/utils/audioUtils';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  showLabel?: boolean;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  toggleMute,
  handleVolumeChange,
  className,
  showLabel = false
}) => {
  // Ensure volume is always in 0-100 range for display
  const displayVolume = formatVolumeForDisplay(volume);
  
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <button
        onClick={toggleMute}
        className="text-gray-500 hover:text-gold transition-colors duration-300"
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted || displayVolume === 0 ? (
          <VolumeX className="w-5 h-5" />
        ) : (
          <Volume2 className="w-5 h-5" />
        )}
      </button>
      
      <div className="flex flex-col">
        {showLabel && (
          <span className="text-xs text-gray-500 mb-1">{displayVolume}%</span>
        )}
        <input
          type="range"
          min="0"
          max="100"
          value={displayVolume}
          onChange={handleVolumeChange}
          className="w-24 accent-gold"
          aria-label="Volume control"
          style={{ accentColor: '#FFD700' }}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
