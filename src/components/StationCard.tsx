
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRadio } from '@/hooks/useRadioContext';
import { RadioStation } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface StationCardProps {
  station: RadioStation;
  isPlaying?: boolean;
  onPlayToggle?: (id: string) => void;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const StationCard: React.FC<StationCardProps> = ({ 
  station, 
  isPlaying = false, 
  onPlayToggle, 
  onClick,
  className,
  style 
}) => {
  const { setCurrentPlayingStation, setAudioState } = useRadio();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onPlayToggle) {
      onPlayToggle(station.id);
    } else {
      // Direct control for when onPlayToggle is not provided
      if (isPlaying) {
        setCurrentPlayingStation(null);
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      } else {
        if (station?.streamUrl) {
          setCurrentPlayingStation(station.id);
          // Force audio to play state immediately
          setAudioState(prev => ({ ...prev, isPlaying: true }));
        } else {
          toast({
            title: "Stream Not Available",
            description: "This station doesn't have a stream URL configured.",
            variant: "destructive"
          });
        }
      }
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Default behavior if onClick is not provided
      const stationSlug = station.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
      navigate(`/stations/${stationSlug}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "rounded-lg overflow-hidden border border-gray-light hover:shadow-md transition-all duration-300",
        "flex flex-col h-full cursor-pointer",
        "bg-white dark:bg-gray-dark", 
        className
      )}
      style={style}
    >
      <div className="relative w-full max-w-[280px] mx-auto">
        <AspectRatio ratio={16 / 9} className="bg-gray-100 dark:bg-gray-800">
          <img 
            src={station.image} 
            alt={station.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            loading="lazy"
          />
        </AspectRatio>
        
        <button
          className={cn(
            "absolute bottom-3 right-3 rounded-full w-10 h-10 flex items-center justify-center shadow-md",
            isPlaying 
              ? "bg-red-500 hover:bg-red-600" 
              : "bg-blue hover:bg-blue-dark"
          )}
          onClick={handlePlayClick}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-white" />
          ) : (
            <Play className="w-5 h-5 text-white ml-0.5" />
          )}
        </button>
        
        {station.isLive && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-0.5 rounded text-xs font-medium flex items-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1 animate-pulse"></span>
            {station.chatEnabled ? 'LIVE CHAT' : 'LIVE'}
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-medium mb-1 line-clamp-1 text-black dark:text-white">{station.name}</h3>
        <p className="text-xs text-gray dark:text-gray-300 mb-3 line-clamp-1">{station.genre}</p>
        
        <div className="mt-auto flex items-center text-xs text-gray dark:text-gray-400">
          <Users className="w-3.5 h-3.5 mr-1" />
          <span>{station.listeners} listeners</span>
        </div>
      </div>
    </div>
  );
};

export default StationCard;
