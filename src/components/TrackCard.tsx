
import React from 'react';
import { cn } from '@/lib/utils';
import { Play, Pause, Volume2, Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatTime } from '@/utils/formatTime';
import { Track } from '@/models/Track';

export interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
  renderTrackActions?: (track: Track) => React.ReactNode;
  className?: string;
  compact?: boolean;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  onPlay,
  onLike,
  onShare,
  newComment,
  onCommentChange,
  onSubmitComment,
  formatDuration,
  renderTrackActions,
  className,
  compact = false
}) => {
  if (compact) {
    return (
      <div className={cn(
        "flex items-center p-3 rounded-lg hover:bg-gray-lightest dark:hover:bg-gray-dark transition-colors",
        isPlaying && "bg-gold/5 border-l-2 border-gold",
        className
      )}>
        <div className="relative flex-shrink-0 w-12 h-12 mr-3">
          <img 
            src={track.coverImage} 
            alt={`${track.artist} - ${track.title}`} 
            className="w-full h-full object-cover rounded"
          />
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPlay();
            }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded hover:bg-black/60 transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white" />
            ) : (
              <Play className="w-5 h-5 text-white" />
            )}
          </button>
        </div>
        
        <div className="flex-grow min-w-0">
          <h3 className="text-sm font-medium truncate">{track.title}</h3>
          <p className="text-xs text-gray-dark dark:text-gray-light truncate">{track.artist}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onLike}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Heart className="w-4 h-4" />
          </button>
          
          <button
            onClick={onShare}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <Share2 className="w-4 h-4" />
          </button>
          
          <span className="text-xs text-gray-dark dark:text-gray-light">
            {formatDuration(track.duration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-xl border border-gray-light dark:border-gray-dark hover:shadow-md transition-all duration-300",
      isPlaying && "border-gold/50 bg-gold/5",
      className
    )}>
      <div className="aspect-square overflow-hidden">
        <img 
          src={track.coverImage} 
          alt={`${track.artist} - ${track.title}`} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPlay();
                }}
                className="w-12 h-12 rounded-full bg-gold text-black flex items-center justify-center hover:bg-gold-dark transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6 ml-1" />
                )}
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={onLike}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Heart className="w-4 h-4 text-white" />
                </button>
                
                <button
                  onClick={onShare}
                  className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Share2 className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isPlaying && (
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-black" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-medium truncate">{track.title}</h3>
            <p className="text-sm text-gray-dark dark:text-gray-light truncate">{track.artist}</p>
          </div>
          <span className="text-xs text-gray-dark dark:text-gray-light flex-shrink-0 ml-2">
            {formatDuration(track.duration)}
          </span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-dark dark:text-gray-light">
          <span className="px-2 py-1 rounded-full bg-gray-lightest dark:bg-gray-dark">{track.genre}</span>
          <div className="flex space-x-3">
            <span>{track.playCount || 0} plays</span>
            <span>{track.likes || 0} likes</span>
            <span>{track.comments?.length || 0} comments</span>
          </div>
        </div>
      </div>
      
      {renderTrackActions && renderTrackActions(track)}
    </div>
  );
};

export default TrackCard;
