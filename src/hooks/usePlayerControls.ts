
import { useState, useRef, useEffect } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';

export const usePlayerControls = () => {
  const { audioState, setAudioState } = useRadio();
  const { currentPlayingTrack } = useTrack();
  const prevVolume = useRef(audioState.volume);
  
  // State for player UI
  const [stationInfo, setStationInfo] = useState({
    name: 'WaveRadio - House',
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
  
  // Sync with audio state
  useEffect(() => {
    setIsPlaying(audioState.isPlaying);
  }, [audioState.isPlaying]);
  
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
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>, audioRef: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (!audioRef.current) return;
    const position = parseInt(e.target.value, 10);
    audioRef.current.currentTime = position;
    setCurrentTime(position);
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
    setVolume,
    isMuted,
    setIsMuted,
    prevVolume,
    
    // Methods
    togglePlayPause,
    toggleMute,
    handleVolumeChange,
    handleProgressChange
  };
};

export default usePlayerControls;
