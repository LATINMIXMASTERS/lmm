
import { useState, useRef } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from "@/components/ui/toast";

interface UsePlayerProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
}

const usePlayer = ({ audioRef }: UsePlayerProps) => {
  const { likeTrack, addComment, shareTrack } = useTrack();
  const { currentPlayingTrack } = useTrack();
  const { audioState, setAudioState } = useRadio();
  const { toast } = useToast();
  
  const prevVolume = useRef(audioState.volume);
  
  // State for player UI
  const [stationInfo, setStationInfo] = useState({
    name: 'LATINMIXMASTERS - House',
    currentTrack: 'Unknown Artist - Groove Session',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(127);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  
  // Audio control state
  const [isPlaying, setIsPlaying] = useState(audioState.isPlaying);
  const [volume, setVolume] = useState(audioState.volume);
  const [isMuted, setIsMuted] = useState(audioState.isMuted);
  
  // Player control handlers
  const togglePlayPause = (audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
      });
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
      setAudioState(prev => ({ ...prev, volume: prevVolume.current, isMuted: false }));
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
      setAudioState(prev => ({ ...prev, volume: 0, isMuted: true }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setAudioState(prev => ({ 
      ...prev, 
      volume: newVolume, 
      isMuted: newVolume === 0 
    }));
    
    // Don't directly set volume here - the useVolumeEffect hook will handle that
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>, audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!audioRef.current) return;
    const position = parseInt(e.target.value, 10);
    audioRef.current.currentTime = position;
    setCurrentTime(position);
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
        action: (
          <ToastAction altText="OK">OK</ToastAction>
        )
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

  return {
    // State
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
    
    // Methods
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleProgressChange,
    handleLike,
    handleShare,
    handleAddComment
  };
};

export default usePlayer;
