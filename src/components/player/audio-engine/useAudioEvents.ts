
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseAudioEventsProps {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  onTimeUpdate: (currentTime: number) => void;
  onDurationChange: (duration: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  setAudioState: (prev: any) => void;
}

export const useAudioEvents = ({
  audioRef,
  onTimeUpdate,
  onDurationChange,
  onPlayStateChange,
  setAudioState
}: UseAudioEventsProps) => {
  const { toast } = useToast();
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        toast({
          title: "Playback Error",
          description: "There was an error playing this stream. Please try a different station.",
          variant: "destructive"
        });
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audioRef.current.addEventListener('playing', () => {
        console.log("Audio is now playing");
        setAudioState(prev => ({ ...prev, isPlaying: true }));
        onPlayStateChange(true);
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log("Audio is now paused");
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        onPlayStateChange(false);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          onTimeUpdate(audioRef.current.currentTime);
        }
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          onDurationChange(audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        onTimeUpdate(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
        onPlayStateChange(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);
  
  // Update volume handler can remain in the main component
};
