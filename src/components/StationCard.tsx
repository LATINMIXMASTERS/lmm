
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, Radio, Heart, User, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StationCardProps {
  station: {
    id: string;
    name: string;
    genre: string;
    image: string;
    listeners?: number;
    isLive?: boolean;
    currentDJ?: string;
  };
  isPlaying: boolean;
  onPlayToggle: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

const StationCard: React.FC<StationCardProps> = ({
  station,
  isPlaying,
  onPlayToggle,
  className,
  style
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlayToggle(station.id);
  };

  return (
    <Link
      to={`/stations/${station.id}`}
      className={cn(
        'group rounded-lg overflow-hidden bg-white border border-gray-lightest transition-all duration-300 block',
        'hover:shadow-md hover:border-gray-light hover:translate-y-[-4px]',
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-lightest animate-pulse-subtle" />
        )}
        <img
          src={station.image}
          alt={station.name}
          className={cn(
            'w-full h-full object-cover transition-transform duration-600',
            isHovered ? 'scale-105' : 'scale-100'
          )}
          loading="lazy"
          onLoad={handleImageLoad}
        />
        <div 
          className={cn(
            'absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60 transition-opacity duration-300',
            isHovered ? 'opacity-80' : 'opacity-60'
          )}
        />
        
        {/* Play button overlay */}
        <button
          className={cn(
            'absolute inset-0 flex items-center justify-center transition-all duration-300',
            isHovered || isPlaying ? 'opacity-100' : 'opacity-0'
          )}
          onClick={handlePlayClick}
          aria-label={isPlaying ? 'Pause station' : 'Play station'}
        >
          <div 
            className={cn(
              'w-14 h-14 rounded-full bg-blue/90 text-white flex items-center justify-center',
              'transition-all duration-300 shadow-lg',
              isHovered ? 'scale-100' : 'scale-90'
            )}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-0.5" />
            )}
          </div>
        </button>
        
        {/* Status badges */}
        <div className="absolute top-3 left-3 flex items-center space-x-2">
          {station.isLive && (
            <div className="px-2 py-1 bg-red-500/80 backdrop-blur-sm rounded text-white text-xs font-medium flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse-subtle"></span>
              LIVE
            </div>
          )}
        </div>
        
        <div className="absolute top-3 right-3">
          <button 
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-gray-dark hover:text-blue transition-colors duration-300"
            aria-label="Add to favorites"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <Heart className="w-4 h-4" />
          </button>
        </div>
        
        {/* Current DJ */}
        {station.currentDJ && (
          <div className="absolute bottom-3 left-3 right-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded flex items-center text-white text-xs">
            <User className="w-3 h-3 mr-1" />
            <span className="truncate">{station.currentDJ}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium text-lg line-clamp-1">{station.name}</h3>
            <p className="text-sm text-gray mt-1">{station.genre}</p>
          </div>
          <div className="flex items-center text-xs text-gray">
            <Radio className="w-3 h-3 mr-1" />
            {station.listeners?.toLocaleString() || '—'}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StationCard;
