
import { useState, useEffect } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

interface UsePlayerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const usePlayer = ({ audioRef }: UsePlayerProps) => {
  const { audioState, setAudioState } = useRadio();
  const { toast } = useToast();
  
  // Station/track info state
  const [stationInfo, setStationInfo] = useState({
    name: '',
    currentTrack: '',
    coverImage: '',
    metadata: undefined
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(audioState.volume || 1);
  const [isMuted, setIsMuted] = useState(audioState.isMuted || false);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  
  // Sync volume state with audio element and context
  useEffect(() => {
    setVolume(audioState.volume);
    setIsMuted(audioState.isMuted);
  }, [audioState.volume, audioState.isMuted]);
  
  // Toggle play/pause
  const togglePlayPause = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      setAudioState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            setAudioState(prev => ({ ...prev, isPlaying: true }));
          })
          .catch(error => {
            console.error('Play error:', error);
            toast({
              title: "Playback Error",
              description: "Cannot play this audio. Please try again.",
              variant: "destructive"
            });
          });
      }
    }
  };
  
  // Volume controls
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    
    setAudioState(prev => ({ 
      ...prev, 
      volume: newVolume,
      isMuted: newVolume === 0
    }));
    
    setIsMuted(newVolume === 0);
  };
  
  const toggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    
    if (audioRef.current) {
      audioRef.current.muted = newMutedState;
    }
    
    setAudioState(prev => ({ ...prev, isMuted: newMutedState }));
  };
  
  // Progress bar
  const handleProgressChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    audioRef: React.MutableRefObject<HTMLAudioElement | null>
  ) => {
    if (!audioRef.current || !isTrackPlaying) return;
    
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    audioRef.current.currentTime = newTime;
  };
  
  // Like and share handlers (stubs for now)
  const handleLike = () => setIsLiked(!isLiked);
  const handleShare = () => {
    // Share functionality - could be expanded
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Share URL copied to clipboard"
        });
      });
  };
  
  // Comments
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    const newCommentObj = {
      id: Date.now().toString(),
      username: 'You',
      text: newComment,
      date: new Date().toISOString()
    };
    
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

  return {
    stationInfo,
    setStationInfo,
    isPlaying,
    setIsPlaying,
    isTrackPlaying,
    setIsTrackPlaying,
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    isMuted,
    comments,
    setComments,
    likes,
    setLikes,
    isLiked,
    setIsLiked,
    newComment,
    setNewComment,
    isExpanded,
    setIsExpanded,
    showComments,
    setShowComments,
    togglePlayPause,
    handleVolumeChange,
    toggleMute,
    handleProgressChange,
    handleLike,
    handleShare,
    handleAddComment
  };
};

export default usePlayer;
