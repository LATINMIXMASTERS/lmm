
import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  toggleMute: () => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  toggleMute,
  handleVolumeChange,
  className
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className || ''}`}>
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
  );
};

export default VolumeControl;
