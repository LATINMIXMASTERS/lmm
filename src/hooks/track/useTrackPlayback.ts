
import { useState } from 'react';
import { useTrack } from '@/hooks/useTrackContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Custom hook for track playback functionality
 * Manages track playback state and actions
 */
export const useTrackPlayback = () => {
  const { currentPlayingTrack, setCurrentPlayingTrack, tracks } = useTrack();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [isPlaying, setIsPlaying] = useState(false);

  /**
   * Handles playing a track with authentication check for some features
   * @param trackId - ID of the track to play
   */
  const handlePlayTrack = (trackId: string) => {
    // If it's the same track, toggle play/pause
    if (currentPlayingTrack === trackId) {
      setCurrentPlayingTrack(null);
      setIsPlaying(false);
    } else {
      setCurrentPlayingTrack(trackId);
      setIsPlaying(true);
      
      // Increment play count - could be authenticated only in the future
      // This is handled by the trackContext
      
      // For mobile devices, show a toast with track info
      if (isMobile) {
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          toast({
            title: "Now Playing",
            description: `${track.artist} - ${track.title}`,
          });
        }
      }
    }
  };

  return {
    currentPlayingTrack,
    isPlaying,
    handlePlayTrack
  };
};
