import { Track, Genre, Comment } from '@/models/Track';
import { copyToClipboard } from '@/utils/trackUtils';

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
    
    const shareUrl = `${window.location.origin}/mixes?track=${trackId}`;
    
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
    // This will be triggered by the toast notification with action buttons
    toast({
      title: "Share this track",
      description: `${track.artist} - ${track.title}`,
      action: (
        <div className="flex space-x-2">
          <button 
            onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Check out this mix: ${track.artist} - ${track.title}\n${shareUrl}`)}`, '_blank')}
            className="px-3 py-1 rounded bg-green-500 text-white text-xs"
          >
            WhatsApp
          </button>
          <button 
            onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')}
            className="px-3 py-1 rounded bg-blue-600 text-white text-xs"
          >
            Facebook
          </button>
          <button 
            onClick={() => window.open(`sms:?&body=${encodeURIComponent(`Check out this mix: ${track.artist} - ${track.title}\n${shareUrl}`)}`, '_blank')}
            className="px-3 py-1 rounded bg-gray-500 text-white text-xs"
          >
            SMS
          </button>
          <button 
            onClick={() => {
              copyToClipboard(shareUrl)
                .then(() => {
                  toast({
                    title: "Link copied!",
                    description: "Share link copied to clipboard",
                  });
                })
                .catch(() => {
                  toast({
                    title: "Failed to copy",
                    description: "Could not copy the link to clipboard",
                    variant: "destructive"
                  });
                });
            }}
            className="px-3 py-1 rounded bg-gray-700 text-white text-xs"
          >
            Copy
          </button>
        </div>
      ),
    });
  };

  return {
    likeTrack,
    addComment,
    setCurrentPlayingTrack,
    shareTrack
  };
};
