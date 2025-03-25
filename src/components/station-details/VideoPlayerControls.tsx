
import React from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface VideoPlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  togglePlay: () => void;
  toggleMute: () => void;
  toggleFullscreen: () => void;
  handleVolumeChange: (value: number[]) => void;
  formatTime: (time: number) => string;
}

const VideoPlayerControls: React.FC<VideoPlayerControlsProps> = ({
  isPlaying,
  isMuted,
  isFullscreen,
  volume,
  currentTime,
  duration,
  togglePlay,
  toggleMute,
  toggleFullscreen,
  handleVolumeChange,
  formatTime
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      {/* Progress bar */}
      {duration > 0 && (
        <div className="mb-2">
          <Slider
            value={[currentTime]}
            min={0}
            max={duration}
            step={0.1}
            onValueChange={(values) => {
              if (values.length > 0 && values[0] !== currentTime) {
                const video = document.querySelector('video');
                if (video) {
                  video.currentTime = values[0];
                }
              }
            }}
            className="cursor-pointer"
          />
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={togglePlay}
          >
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
          
          <div className="w-24 hidden sm:block">
            <Slider
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="cursor-pointer"
            />
          </div>
        </div>
        
        <div className="flex items-center">
          {duration > 0 && (
            <div className="text-xs text-white/80 mr-2">
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayerControls;
