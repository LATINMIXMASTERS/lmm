
import React from 'react';
import { cn } from '@/lib/utils';
import TrackInfo from './TrackInfo';
import PlayerControls from './PlayerControls';
import WaveformVisualization from './WaveformVisualization';
import CommentSection from '@/components/CommentSection';

interface PlayerContainerProps {
  stationInfo: {
    name: string;
    currentTrack: string;
    coverImage: string;
  };
  isTrackPlaying: boolean;
  currentTime: number;
  duration: number;
  handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isPlaying: boolean;
  togglePlayPause: () => void;
  volume: number;
  isMuted: boolean;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  handleLike: () => void;
  handleShare: () => void;
  isLiked: boolean;
  showComments: boolean;
  setShowComments: (value: boolean) => void;
  isExpanded: boolean;
  setIsExpanded: (value: boolean) => void;
  comments: any[];
  newComment: string;
  setNewComment: (value: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
  className?: string;
}

const PlayerContainer: React.FC<PlayerContainerProps> = ({
  stationInfo,
  isTrackPlaying,
  currentTime,
  duration,
  handleProgressChange,
  isPlaying,
  togglePlayPause,
  volume,
  isMuted,
  handleVolumeChange,
  toggleMute,
  handleLike,
  handleShare,
  isLiked,
  showComments,
  setShowComments,
  isExpanded,
  setIsExpanded,
  comments,
  newComment,
  setNewComment,
  handleAddComment,
  className
}) => {
  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 glass border-t border-gray-lightest shadow-md z-40",
        "transition-all duration-400 ease-in-out",
        showComments ? "h-96" : (isExpanded ? "h-48" : "h-20"),
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full">
        <div className="flex items-center h-20">
          <TrackInfo 
            stationInfo={stationInfo}
            isTrackPlaying={isTrackPlaying}
            currentTime={currentTime}
            duration={duration}
            handleProgressChange={handleProgressChange}
            setIsExpanded={setIsExpanded}
            isExpanded={isExpanded}
          />
          
          <PlayerControls
            isPlaying={isPlaying}
            togglePlayPause={togglePlayPause}
            volume={volume}
            isMuted={isMuted}
            handleVolumeChange={handleVolumeChange}
            toggleMute={toggleMute}
            currentTime={currentTime}
            duration={duration}
            handleProgressChange={handleProgressChange}
            isTrackPlaying={isTrackPlaying}
            handleLike={handleLike}
            handleShare={handleShare}
            setShowComments={setShowComments}
            isLiked={isLiked}
            showComments={showComments}
            isExpanded={isExpanded}
          />
        </div>
        
        {isExpanded && (
          <div className="px-4 py-4">
            <WaveformVisualization isPlaying={isPlaying} />
          </div>
        )}
        
        {showComments && (
          <div className="px-4 overflow-y-auto h-48 border-t border-gray-100 pt-4">
            <h3 className="font-medium mb-3">Comments ({comments.length})</h3>
            
            <CommentSection 
              comments={comments}
              newComment={newComment}
              onCommentChange={setNewComment}
              onSubmitComment={handleAddComment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerContainer;
