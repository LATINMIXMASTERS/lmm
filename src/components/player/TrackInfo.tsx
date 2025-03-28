
import React from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface TrackInfoProps {
  stationInfo: {
    name: string;
    currentTrack: string;
    coverImage: string;
    metadata?: {
      title?: string;
      artist?: string;
      album?: string;
      coverArt?: string;
    };
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
  // Calculate progress percentage for the progress bar
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  
  // Format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Determine which image to show (prioritize metadata coverArt if available)
  const coverImage = stationInfo.metadata?.coverArt || stationInfo.coverImage;
  
  // Get artist and title from metadata when available
  const artist = stationInfo.metadata?.artist || '';
  const title = stationInfo.metadata?.title || stationInfo.currentTrack;
  
  // For radio stations, show the station name if no artist is provided
  const displayArtist = isTrackPlaying 
    ? artist 
    : (artist || stationInfo.name);
  
  // Check if the cover image is loading or not available
  const isImageLoading = !coverImage || coverImage === '';
  
  return (
    <div className="flex-1 flex items-center min-w-0 pr-4">
      {/* Cover Image */}
      <div 
        className={cn(
          "w-12 h-12 md:w-16 md:h-16 rounded overflow-hidden flex-shrink-0",
          "border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800",
          "mr-3 md:mr-4"
        )}
      >
        {isImageLoading ? (
          <Skeleton className="w-full h-full" />
        ) : (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default cover image if loading fails
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200&auto=format&fit=crop';
            }}
          />
        )}
      </div>
      
      {/* Track Information */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-center">
          <div className="truncate pr-2">
            <h3 className={cn(
              "font-medium text-sm md:text-base truncate",
              isTrackPlaying 
                ? "text-primary dark:text-primary-foreground" 
                : "text-blue dark:text-blue-light"
            )}>
              {title || 'Loading...'}
            </h3>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">
              {displayArtist || 'Unknown Artist'}
            </p>
          </div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            aria-label={isExpanded ? "Collapse player" : "Expand player"}
          >
            <ChevronUp className={cn(
              "w-5 h-5 transition-transform duration-300",
              isExpanded ? "rotate-0" : "rotate-180"
            )} />
          </button>
        </div>
        
        {/* Progress Bar (only for tracks, not for radio) */}
        {isTrackPlaying && (
          <div className="mt-1 md:mt-2 flex items-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-right mr-2">
              {formatTime(currentTime)}
            </span>
            <div className="flex-1 relative">
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleProgressChange}
                className="w-full h-1.5 appearance-none bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                style={{
                  background: `linear-gradient(to right, var(--color-blue) 0%, var(--color-blue) ${progressPercentage}%, var(--color-gray-200) ${progressPercentage}%, var(--color-gray-200) 100%)`
                }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 w-8 text-left ml-2">
              {formatTime(duration)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackInfo;
