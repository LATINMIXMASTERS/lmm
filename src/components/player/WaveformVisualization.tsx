
import React from 'react';
import { cn } from '@/lib/utils';

interface WaveformVisualizationProps {
  isPlaying: boolean;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isPlaying }) => {
  // Generate waveform for visualization
  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.random() * 100;
    return (
      <div 
        key={i}
        className={cn(
          "w-1 bg-blue mx-0.5 rounded-sm",
          isPlaying && i <= 30 ? "animate-pulse" : ""
        )}
        style={{ 
          height: `${height}%`, 
          opacity: isPlaying && i > 30 ? 0.3 : 0.7
        }}
      ></div>
    );
  });

  return (
    <div className="flex h-16 items-end justify-center gap-0">
      {waveformBars}
    </div>
  );
};

export default WaveformVisualization;
