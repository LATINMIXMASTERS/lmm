
import { Track, Genre, Comment } from '@/models/Track';
import { copyToClipboard } from '@/utils/trackUtils';
import { ToastAction } from '@/components/ui/toast';

/**
 * Creates track interaction action functions
 * These actions handle user interactions with tracks:
 * - Liking tracks
 * - Commenting on tracks
 * - Playing tracks
 * - Sharing tracks
 */
export const createTrackInteractionActions = (
  state: { tracks: Track[], genres: Genre[] },
  dispatch: React.Dispatch<any>,
  toast: any,
  setCurrentPlayingStation: (stationId: string | null) => void
) => {
  // Like a track
  const likeTrack = (trackId: string) => {
    dispatch({ type: 'LIKE_TRACK', payload: trackId });
    const updatedTracks = state.tracks.map(track => 
      track.id === trackId ? { ...track, likes: track.likes + 1 } : track
    );
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
  };

  // Add a comment to a track
  const addComment = (trackId: string, commentData: Omit<Comment, 'id' | 'date'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toISOString()
    };
    
    dispatch({ 
      type: 'ADD_COMMENT', 
      payload: { 
        trackId, 
        comment: newComment 
      } 
    });
    
    const updatedTracks = state.tracks.map(track => {
      if (track.id === trackId) {
        const comments = track.comments || [];
        return {
          ...track,
          comments: [...comments, newComment]
        };
      }
      return track;
    });
    
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
  };

  // Set currently playing track
  const setCurrentPlayingTrack = (trackId: string | null) => {
    dispatch({ type: 'SET_CURRENT_PLAYING_TRACK', payload: trackId });
    if (trackId) {
      setCurrentPlayingStation(null);
    }
  };

  // Share a track - Enhanced with multiple sharing options
  const shareTrack = (trackId: string) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    // Create URL-friendly versions of artist and track names
    const artistSlug = track.artist.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const titleSlug = track.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const shareUrl = `${window.location.origin}/mixes/${artistSlug}/${titleSlug}`;
    
    // Create share data
    const shareData = {
      title: `${track.artist} - ${track.title}`,
      text: 'Check out this awesome mix on Latin Mix Masters!',
      url: shareUrl,
    };
    
    // Show sharing options
    if (navigator.share) {
      // Use native share dialog if available
      navigator.share(shareData).catch((error) => {
        console.log('Error sharing', error);
        showShareDialog(track, shareUrl, toast);
      });
    } else {
      // Show custom share dialog/actions
      showShareDialog(track, shareUrl, toast);
    }
  };

  // Helper function to show custom share options
  const showShareDialog = (track: Track, shareUrl: string, toast: any) => {
    // Create custom share dialog with social media options
    toast({
      title: "Share this track",
      description: `${track.artist} - ${track.title}`,
      // Fix: Use JSX element instead of object with label and onClick
      action: (
        <ToastAction altText="Share" onClick={() => {
          console.log("User clicked share");
          // Copy to clipboard as a fallback action
          copyToClipboard(shareUrl);
        }}>
          Share
        </ToastAction>
      )
    });
    
    // This is handled by the useTrackSharing hook elsewhere
  };

  return {
    likeTrack,
    addComment,
    setCurrentPlayingTrack,
    shareTrack
  };
};
