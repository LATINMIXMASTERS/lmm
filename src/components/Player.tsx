
import React, { useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import usePlayerControls from '@/hooks/usePlayerControls';
import AudioEngine from '@/components/player/audio-engine';
import PlayerContainer from '@/components/player/PlayerContainer';
import { useIsMobile } from '@/hooks/use-mobile';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const { likeTrack, addComment, shareTrack } = useTrack();
  const { currentPlayingStation } = useRadio();
  const { currentPlayingTrack } = useTrack();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataTimerRef = useRef<number | null>(null);
  
  const {
    stationInfo,
    setStationInfo,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    isExpanded,
    setIsExpanded,
    showComments,
    setShowComments,
    likes,
    setLikes,
    isLiked,
    setIsLiked,
    comments,
    setComments,
    newComment,
    setNewComment,
    isTrackPlaying,
    setIsTrackPlaying,
    isPlaying,
    setIsPlaying,
    volume,
    isMuted,
    togglePlayPause: baseTogglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleProgressChange: baseHandleProgressChange
  } = usePlayerControls();

  const shouldShowPlayer = currentPlayingStation || currentPlayingTrack;

  const togglePlayPause = () => baseTogglePlayPause(audioRef);
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    baseHandleProgressChange(e, audioRef);
  };

  const handleLike = () => {
    if (currentPlayingTrack) {
      likeTrack(currentPlayingTrack);
      if (isLiked) {
        setLikes(likes - 1);
      } else {
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    }
  };

  const handleShare = () => {
    if (currentPlayingTrack) {
      shareTrack(currentPlayingTrack);
    } else {
      toast({
        title: "Share feature",
        description: "Share functionality will be implemented soon!",
      });
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentPlayingTrack) return;
    
    addComment(currentPlayingTrack, {
      userId: 'current-user',
      username: 'You',
      text: newComment
    });
    
    const newCommentObj = {
      id: Date.now().toString(),
      username: 'You',
      text: newComment,
      date: new Date().toISOString()
    };
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  if (!shouldShowPlayer) {
    return null;
  }

  // Different player layout for mobile
  const playerClassNames = cn(
    className,
    isMobile ? "fixed bottom-0 left-0 right-0 z-40 pb-safe" : ""
  );

  return (
    <>
      <AudioEngine
        onTimeUpdate={setCurrentTime}
        onDurationChange={setDuration}
        onPlayStateChange={setIsPlaying}
        audioRef={audioRef}
        metadataTimerRef={metadataTimerRef}
        stationInfo={stationInfo}
        setStationInfo={setStationInfo}
        setIsTrackPlaying={setIsTrackPlaying}
        setComments={setComments}
        setLikes={setLikes}
      />
      
      <PlayerContainer
        stationInfo={stationInfo}
        isTrackPlaying={isTrackPlaying}
        currentTime={currentTime}
        duration={duration}
        handleProgressChange={handleProgressChange}
        isPlaying={isPlaying}
        togglePlayPause={togglePlayPause}
        volume={volume}
        isMuted={isMuted}
        handleVolumeChange={handleVolumeChange}
        toggleMute={toggleMute}
        handleLike={handleLike}
        handleShare={handleShare}
        isLiked={isLiked}
        showComments={showComments}
        setShowComments={setShowComments}
        isExpanded={isExpanded}
        setIsExpanded={setIsExpanded}
        comments={comments}
        newComment={newComment}
        setNewComment={setNewComment}
        handleAddComment={handleAddComment}
        className={playerClassNames}
        isMobile={isMobile}
      />
    </>
  );
};

export default Player;
