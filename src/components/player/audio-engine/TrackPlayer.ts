
import { Track } from '@/models/Track';
import { useTrack } from '@/hooks/useTrackContext';

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

  // Get track information from context
  const { tracks } = useTrack();
  const track = tracks.find(t => t.id === trackId);
  
  if (!track) {
    console.error(`Track with ID ${trackId} not found`);
    return;
  }
  
  // Set up the audio source
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
  } catch (error) {
    console.error('Error setting up track player:', error);
  }
};
