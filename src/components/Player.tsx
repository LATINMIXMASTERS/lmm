
import React, { useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import usePlayerControls from '@/hooks/usePlayerControls';
import AudioEngine from '@/components/player/AudioEngine';
import PlayerContainer from '@/components/player/PlayerContainer';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const { likeTrack, addComment, shareTrack } = useTrack();
  const { toast } = useToast();
  
  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const metadataTimerRef = useRef<number | null>(null);
  
  // Player controls hooks
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

  const togglePlayPause = () => baseTogglePlayPause(audioRef);
  
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    baseHandleProgressChange(e, audioRef);
  };

  const handleLike = () => {
    const { currentPlayingTrack } = useTrack();
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
    const { currentPlayingTrack } = useTrack();
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
    const { currentPlayingTrack } = useTrack();
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

  return (
    <>
      {/* Hidden audio engine component that handles audio logic */}
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
      
      {/* Visible player UI */}
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
        className={className}
      />
    </>
  );
};

export default Player;
