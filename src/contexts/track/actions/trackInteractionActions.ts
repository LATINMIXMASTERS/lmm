
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

  // Share a track
  const shareTrack = (trackId: string) => {
    const track = state.tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const shareUrl = `${window.location.origin}/mixes?track=${trackId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${track.artist} - ${track.title}`,
        text: 'Check out this awesome mix on Latin Mix Masters!',
        url: shareUrl,
      }).catch((error) => {
        console.log('Error sharing', error);
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
      });
    } else {
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
    }
  };

  return {
    likeTrack,
    addComment,
    setCurrentPlayingTrack,
    shareTrack
  };
};
