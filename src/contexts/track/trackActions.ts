
import { Track, Genre, Comment } from '@/models/Track';
import { generateWaveformData, getTracksByGenre, getTracksByUser, getGenreById, canEditTrack } from '@/utils/trackUtils';
import { copyToClipboard } from '@/utils/trackUtils';

export const createTrackActions = (
  state: { tracks: Track[], genres: Genre[] },
  dispatch: React.Dispatch<any>,
  userInfo: { id?: string, isAdmin?: boolean } | null,
  toast: any,
  setCurrentPlayingStation: (stationId: string | null) => void
) => {
  // Add a new track
  const addTrack = (trackData: Omit<Track, 'id' | 'likes' | 'uploadDate'>) => {
    if (trackData.fileSize > 262144000) {
      toast({
        title: "File too large",
        description: "Maximum file size is 250MB",
        variant: "destructive"
      });
      throw new Error("File too large");
    }

    const newTrack: Track = {
      ...trackData,
      id: Math.random().toString(36).substring(2, 11),
      likes: 0,
      uploadDate: new Date().toISOString(),
      waveformData: generateWaveformData(),
      playCount: 0,
      duration: Math.floor(Math.random() * 300) + 180
    };
    
    dispatch({ type: 'ADD_TRACK', payload: newTrack });
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify([...state.tracks, newTrack]));
    
    toast({
      title: "Track uploaded",
      description: "Your track has been successfully uploaded",
    });
    
    return newTrack;
  };

  // Delete a track
  const deleteTrack = (trackId: string): boolean => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to delete tracks",
        variant: "destructive"
      });
      return false;
    }

    const track = state.tracks.find(t => t.id === trackId);
    if (!track) {
      toast({
        title: "Track not found",
        description: "The track you're trying to delete doesn't exist",
        variant: "destructive"
      });
      return false;
    }

    if (!userInfo.isAdmin && track.uploadedBy !== userInfo.id) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to delete this track",
        variant: "destructive"
      });
      return false;
    }

    dispatch({ type: 'DELETE_TRACK', payload: trackId });
    const updatedTracks = state.tracks.filter(t => t.id !== trackId);
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
    
    toast({
      title: "Track deleted",
      description: "The track has been successfully deleted",
    });
    
    return true;
  };

  // Update a track
  const updateTrack = (trackId: string, trackData: Partial<Track>): boolean => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update tracks",
        variant: "destructive"
      });
      return false;
    }

    const track = state.tracks.find(t => t.id === trackId);
    if (!track) {
      toast({
        title: "Track not found",
        description: "The track you're trying to update doesn't exist",
        variant: "destructive"
      });
      return false;
    }
    
    if (!userInfo.isAdmin && track.uploadedBy !== userInfo.id) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to update this track",
        variant: "destructive"
      });
      return false;
    }

    dispatch({ 
      type: 'UPDATE_TRACK', 
      payload: { trackId, trackData } 
    });
    
    const updatedTracks = state.tracks.map(t => 
      t.id === trackId 
        ? { ...t, ...trackData, id: t.id, uploadDate: t.uploadDate, uploadedBy: t.uploadedBy }
        : t
    );
    
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
    
    toast({
      title: "Track updated",
      description: "The track has been successfully updated",
    });
    
    return true;
  };

  // Add a new genre
  const addGenre = (genreName: string) => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a genre",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }

    if (state.genres.some(g => g.name.toLowerCase() === genreName.toLowerCase())) {
      toast({
        title: "Genre exists",
        description: "This genre already exists",
        variant: "destructive"
      });
      throw new Error("Genre exists");
    }

    const newGenre: Genre = {
      id: Math.random().toString(36).substring(2, 11),
      name: genreName,
      createdBy: userInfo.id || 'unknown',
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_GENRE', payload: newGenre });
    localStorage.setItem('latinmixmasters_genres', JSON.stringify([...state.genres, newGenre]));
    
    toast({
      title: "Genre added",
      description: `The genre "${genreName}" has been added`,
    });
    
    return newGenre;
  };

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
    addTrack,
    deleteTrack,
    updateTrack,
    addGenre,
    likeTrack,
    addComment,
    setCurrentPlayingTrack,
    shareTrack
  };
};
