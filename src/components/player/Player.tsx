
import React, { useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import usePlayer from '@/hooks/usePlayer';
import AudioEngine from '@/components/player/AudioEngine';
import PlayerContainer from '@/components/player/PlayerContainer';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const { currentPlayingStation } = useRadio();
  const { currentPlayingTrack } = useTrack();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataTimerRef = useRef<number | null>(null);
  
  const player = usePlayer({ audioRef });

  const shouldShowPlayer = currentPlayingStation || currentPlayingTrack;

  if (!shouldShowPlayer) {
    return null;
  }

  return (
    <>
      <AudioEngine
        onTimeUpdate={player.setCurrentTime}
        onDurationChange={player.setDuration}
        onPlayStateChange={player.setIsPlaying}
        audioRef={audioRef}
        metadataTimerRef={metadataTimerRef}
        stationInfo={player.stationInfo}
        setStationInfo={player.setStationInfo}
        setIsTrackPlaying={player.setIsTrackPlaying}
        setComments={player.setComments}
        setLikes={player.setLikes}
      />
      
      <PlayerContainer
        stationInfo={player.stationInfo}
        isTrackPlaying={player.isTrackPlaying}
        currentTime={player.currentTime}
        duration={player.duration}
        handleProgressChange={(e) => player.handleProgressChange(e, audioRef)}
        isPlaying={player.isPlaying}
        togglePlayPause={() => player.togglePlayPause(audioRef)}
        volume={player.volume}
        isMuted={player.isMuted}
        handleVolumeChange={player.handleVolumeChange}
        toggleMute={player.toggleMute}
        handleLike={player.handleLike}
        handleShare={player.handleShare}
        isLiked={player.isLiked}
        showComments={player.showComments}
        setShowComments={player.setShowComments}
        isExpanded={player.isExpanded}
        setIsExpanded={player.setIsExpanded}
        comments={player.comments}
        newComment={player.newComment}
        setNewComment={player.setNewComment}
        handleAddComment={player.handleAddComment}
        className={className}
      />
    </>
  );
};

export default Player;
