
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [stationInfo, setStationInfo] = useState({
    name: 'WaveRadio - House',
    currentTrack: 'Unknown Artist - Groove Session',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prevVolume, setPrevVolume] = useState(80);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio('https://streams.90s90s.de/danceradio/mp3-192/streams.90s90s.de/');
    audioRef.current.volume = volume / 100;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 glass border-t border-gray-lightest shadow-md z-40",
        "transition-all duration-400 ease-in-out",
        isExpanded ? "h-32 md:h-28" : "h-20",
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full flex items-center">
        {/* Station info - always visible */}
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
              <Radio className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-black truncate">{stationInfo.name}</h4>
            <p className="text-xs text-gray truncate">{stationInfo.currentTrack}</p>
            
            {/* Mobile expanded info */}
            {isExpanded && (
              <div className="md:hidden mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <button 
                    className="text-gray hover:text-black transition-colors duration-300"
                    aria-label="Like station"
                  >
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={toggleMute}
                    className="text-gray hover:text-black transition-colors duration-300"
                    aria-label={isMuted ? "Unmute" : "Mute"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-blue"
                    aria-label="Volume control"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Controls - always visible */}
        <div className="flex items-center space-x-6">
          {/* Desktop volume controls */}
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
          
          {/* Play/Pause button */}
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
          
          {/* Desktop like button */}
          <button 
            className="hidden md:block text-gray hover:text-black transition-colors duration-300"
            aria-label="Like station"
          >
            <Heart className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
