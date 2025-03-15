
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import VolumeControl from './VolumeControl';
import PlaybackControls from './PlaybackControls';
import InteractionControls from './InteractionControls';

interface PlayerControlsProps {
  isPlaying: boolean;
  togglePlayPause: () => void;
  volume: number;
  isMuted: boolean;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleMute: () => void;
  currentTime: number;
  duration: number;
  handleProgressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isTrackPlaying: boolean;
  handleLike: () => void;
  handleShare: () => void;
  setShowComments: (value: boolean) => void;
  isLiked: boolean;
  showComments: boolean;
  isExpanded: boolean;
}

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  togglePlayPause,
  volume,
  isMuted,
  handleVolumeChange,
  toggleMute,
  currentTime,
  duration,
  handleProgressChange,
  isTrackPlaying,
  handleLike,
  handleShare,
  setShowComments,
  isLiked,
  showComments,
  isExpanded
}) => {
  return (
    <>
      <div className="flex items-center space-x-6">
        <PlaybackControls 
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
        />
        
        <div className="hidden md:flex items-center space-x-4">
          <InteractionControls 
            handleLike={handleLike}
            handleShare={handleShare}
            setShowComments={setShowComments}
            isLiked={isLiked}
            showComments={showComments}
          />
        </div>
      </div>
      
      {isExpanded && (
        <div className="md:hidden flex justify-between mt-4">
          <InteractionControls 
            handleLike={handleLike}
            handleShare={handleShare}
            setShowComments={setShowComments}
            isLiked={isLiked}
            showComments={showComments}
          />
          
          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            toggleMute={toggleMute}
            handleVolumeChange={handleVolumeChange}
          />
        </div>
      )}
    </>
  );
};

export default PlayerControls;
