
import React, { useState } from 'react';
import { Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Track, Comment } from '@/models/Track';
import CommentSection from './CommentSection';

interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  onPlay: () => void;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
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
  formatDuration
}) => {
  const [showComments, setShowComments] = useState(false);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={track.coverImage} 
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </div>
          </div>
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
            <p className="text-sm text-gray-600">{track.artist}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{track.genre}</span>
        </div>
        
        {/* Waveform visualization */}
        <div className="flex h-12 items-end space-x-0.5 mb-3">
          {track.waveformData?.map((height: number, i: number) => (
            <div 
              key={i}
              className={cn(
                "flex-1 rounded-sm", 
                isPlaying ? "bg-blue" : "bg-gray-300"
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>{formatDuration(track.duration)}</span>
          <span>{format(new Date(track.uploadDate), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{track.likes}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-1 transition-colors",
                showComments ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{track.comments?.length || 0}</span>
            </button>
            
            <button 
              onClick={onShare}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Comments section */}
        {showComments && (
          <CommentSection 
            comments={track.comments || []}
            newComment={newComment}
            onCommentChange={onCommentChange}
            onSubmitComment={onSubmitComment}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default TrackCard;
