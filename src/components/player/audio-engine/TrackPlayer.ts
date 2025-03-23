
import { Track } from '@/models/Track';

/**
 * Sets up an audio element for playing tracks
 */
export const setupTrackPlayer = (
  audioElement: HTMLAudioElement,
  trackId: string | null,
  setStateInfo: (info: {
    name: string;
    currentTrack: string;
    coverImage: string;
  }) => void,
  setComments: (comments: any[]) => void,
  setLikes: (likes: number) => void
) => {
  // Early return if no track is selected
  if (!trackId) {
    audioElement.pause();
    audioElement.src = '';
    return;
  }

  // Find the track in the provided tracks array
  const findTrack = (tracks: Track[], id: string) => tracks.find(t => t.id === id);
  
  // Set up the audio source
  const setupAudioSource = (track: Track, audioElement: HTMLAudioElement) => {
    try {
      // Handle S3 URLs correctly
      // Include the original URL handling but add support for S3 URLs
      let audioSource = track.audioFile;
      
      // If the URL is an actual URL and not a data URL, make sure it's properly handled
      if (audioSource.startsWith('http') && !audioSource.includes('data:audio')) {
        // This is already a proper URL, use as is
        audioElement.src = audioSource;
      } else if (audioSource.startsWith('/demo-uploads/')) {
        // This is a relative URL, make it absolute
        audioElement.src = audioSource;
      } else if (audioSource.startsWith('data:audio')) {
        // This is a data URL, use as is
        audioElement.src = audioSource;
      } else {
        // Default fallback
        audioElement.src = audioSource;
      }
    } catch (error) {
      console.error('Error setting up audio source:', error);
    }
  };
  
  return (tracks: Track[]) => {
    const track = findTrack(tracks, trackId);
    
    if (!track) {
      console.error(`Track with ID ${trackId} not found`);
      return;
    }
    
    // Set up the audio source
    setupAudioSource(track, audioElement);
    
    // Set station info for the player display
    setStateInfo({
      name: track.artist,
      currentTrack: track.title,
      coverImage: track.coverImage
    });
    
    // Set comments and likes
    setComments(track.comments || []);
    setLikes(track.likes || 0);
    
    // Start playing
    audioElement.load();
    audioElement.play().catch(error => {
      console.error('Error playing track:', error);
    });
  };
};

/**
 * Custom hook for track playback
 */
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
}: {
  currentPlayingTrack: string | null;
  tracks: Track[];
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  metadataTimerRef: React.MutableRefObject<number | null>;
  setStationInfo: (info: {
    name: string;
    currentTrack: string;
    coverImage: string;
  }) => void;
  setIsTrackPlaying: (isPlaying: boolean) => void;
  setComments: (comments: any[]) => void;
  setLikes: (likes: number) => void;
  setAudioState: (state: any) => void;
  onTimeUpdate: (time: number) => void;
  onDurationChange: (duration: number) => void;
}) => {
  // Create a player instance with the current track ID
  const setupPlayer = () => {
    if (!audioRef.current) return;
    
    // Clear any existing metadata polling
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
      metadataTimerRef.current = null;
    }
    
    // Set up the track player
    const playTrack = setupTrackPlayer(
      audioRef.current,
      currentPlayingTrack,
      setStationInfo,
      setComments,
      setLikes
    );
    
    // If valid track, set state and play
    if (currentPlayingTrack) {
      setIsTrackPlaying(true);
      setAudioState((prev: any) => ({ ...prev, isRadioMode: false }));
      
      if (playTrack) {
        playTrack(tracks);
      }
    }
  };
  
  return { setupPlayer };
};
