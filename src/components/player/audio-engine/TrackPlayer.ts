
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/models/Track';

interface TrackPlayerProps {
  currentPlayingTrack: string | null;
  tracks: Track[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: React.MutableRefObject<number | null>;
  setStationInfo: React.Dispatch<React.SetStateAction<{
    name: string;
    currentTrack: string;
    coverImage: string;
  }>>;
  setIsTrackPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setComments: React.Dispatch<React.SetStateAction<any[]>>;
  setLikes: React.Dispatch<React.SetStateAction<number>>;
  setAudioState: (prev: any) => void;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
}

export const useTrackPlayer = ({
  currentPlayingTrack,
  tracks,
  audioRef,
  metadataTimerRef,
  setStationInfo,
  setIsTrackPlaying,
  setComments,
  setLikes,
  setAudioState,
  onTimeUpdate,
  onDurationChange
}: TrackPlayerProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!currentPlayingTrack || !audioRef.current) return;
    
    const track = tracks.find(t => t.id === currentPlayingTrack);
    if (!track) {
      console.error("Track not found:", currentPlayingTrack);
      return;
    }
    
    console.log("Changing audio source to track:", track.audioFile);
    setAudioState(prev => ({ 
      ...prev, 
      currentTrack: currentPlayingTrack,
      currentStation: null
    }));
    
    audioRef.current.pause();
    audioRef.current.src = track.audioFile;
    
    setStationInfo({
      name: track.artist,
      currentTrack: track.title,
      coverImage: track.coverImage
    });
    
    onTimeUpdate(0);
    
    if (track.duration) {
      onDurationChange(track.duration);
    }
    
    audioRef.current.load();
    audioRef.current.play().catch(error => {
      console.error("Failed to play track:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play this track. Please try again.",
        variant: "destructive"
      });
    });
    
    setIsTrackPlaying(true);
    
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
    }
    
    if (track.comments) {
      setComments(track.comments.map((comment: any) => ({
        id: comment.id,
        username: comment.username,
        text: comment.text,
        date: comment.date
      })));
    } else {
      setComments([]);
    }
    
    setLikes(track.likes || 0);
  }, [currentPlayingTrack, tracks]);
};
