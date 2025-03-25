
import { Track, Genre } from '@/models/Track';
import { generateWaveformData } from '@/utils/trackUtils';

/**
 * Creates track CRUD (Create, Read, Update, Delete) action functions
 * These actions handle adding, updating, and deleting tracks
 */
export const createTrackCrudActions = (
  state: { tracks: Track[], genres: Genre[] },
  dispatch: React.Dispatch<any>,
  userInfo: { id?: string, isAdmin?: boolean } | null,
  toast: any
) => {
  // Add a new track
  const addTrack = (trackData: Omit<Track, 'id' | 'likes' | 'uploadDate'>) => {
    if (!userInfo || !userInfo.id) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload tracks",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }
    
    // Ensure the track is uploaded by the current user
    if (trackData.uploadedBy !== userInfo.id) {
      toast({
        title: "Permission denied",
        description: "You can only upload tracks to your own profile",
        variant: "destructive"
      });
      throw new Error("Permission denied");
    }
    
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
    
    try {
      // Use a more efficient approach to store tracks
      // Instead of storing all tracks, store only the recent ones (last 20)
      // This helps prevent exceeding localStorage quota
      const tracksToStore = [...state.tracks.slice(-19), newTrack];
      localStorage.setItem('latinmixmasters_tracks', JSON.stringify(tracksToStore));
    } catch (error) {
      console.error('Error storing tracks in localStorage:', error);
      // Fallback: Remove oldest tracks to make space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          const reducedTracks = [...state.tracks.slice(-10), newTrack];
          localStorage.setItem('latinmixmasters_tracks', JSON.stringify(reducedTracks));
          toast({
            title: "Track uploaded",
            description: "Your track was uploaded, but some older tracks were removed from local storage due to space constraints.",
          });
          return newTrack;
        } catch (fallbackError) {
          console.error('Fallback storage also failed:', fallbackError);
          toast({
            title: "Track uploaded",
            description: "Your track was uploaded but couldn't be saved to local storage due to space constraints.",
          });
          return newTrack;
        }
      }
    }
    
    toast({
      title: "Track uploaded",
      description: "Your track has been successfully uploaded",
    });
    
    return newTrack;
  };

  // Delete a track - Allow admins to delete any track
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

    // Admin can delete any track, regular users can only delete their own
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

  // Update a track - Allow admins to update any track
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
    
    // Admin can update any track, regular users can only update their own
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

  return {
    addTrack,
    deleteTrack,
    updateTrack
  };
};
