
import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { Track, Genre, Comment } from '@/models/Track';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/contexts/RadioContext';
import { trackReducer, initialTrackState, initialGenres } from '@/contexts/track/trackReducer';
import { 
  generateWaveformData, 
  getTracksByGenre, 
  getTracksByUser, 
  getGenreById, 
  canEditTrack,
  copyToClipboard
} from '@/utils/trackUtils';

interface TrackContextType {
  tracks: Track[];
  genres: Genre[];
  addTrack: (track: Omit<Track, 'id' | 'likes' | 'uploadDate'>) => Track;
  deleteTrack: (trackId: string) => boolean;
  updateTrack: (trackId: string, trackData: Partial<Track>) => boolean;
  addGenre: (genreName: string) => Genre;
  getTracksByGenre: (genreId: string) => Track[];
  getTracksByUser: (userId: string) => Track[];
  likeTrack: (trackId: string) => void;
  addComment: (trackId: string, comment: Omit<Comment, 'id' | 'date'>) => void;
  getGenreById: (id: string) => Genre | undefined;
  currentPlayingTrack: string | null;
  setCurrentPlayingTrack: (trackId: string | null) => void;
  generateWaveformData: () => number[];
  shareTrack: (trackId: string) => void;
  canEditTrack: (trackId: string) => boolean;
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

export const TrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trackReducer, initialTrackState);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentPlayingStation } = useRadio();

  // Initialize from localStorage
  useEffect(() => {
    const savedTracks = localStorage.getItem('latinmixmasters_tracks');
    if (savedTracks) {
      dispatch({ type: 'SET_TRACKS', payload: JSON.parse(savedTracks) });
    }
    
    const savedGenres = localStorage.getItem('latinmixmasters_genres');
    if (savedGenres) {
      dispatch({ type: 'SET_GENRES', payload: JSON.parse(savedGenres) });
    } else {
      dispatch({ type: 'SET_GENRES', payload: initialGenres });
      localStorage.setItem('latinmixmasters_genres', JSON.stringify(initialGenres));
    }
  }, []);

  // When a track is selected for playing, stop station streams
  useEffect(() => {
    if (state.currentPlayingTrack) {
      setCurrentPlayingStation(null);
    }
  }, [state.currentPlayingTrack, setCurrentPlayingStation]);

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

  // Delete a track - only if user is admin or the uploader
  const deleteTrack = (trackId: string): boolean => {
    if (!user) {
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

    // Check if user is admin or track uploader
    if (!user.isAdmin && track.uploadedBy !== user.id) {
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

  // Update a track - only if user is admin or the uploader
  const updateTrack = (trackId: string, trackData: Partial<Track>): boolean => {
    if (!user) {
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
    
    // Check if user is admin or track uploader
    if (!user.isAdmin && track.uploadedBy !== user.id) {
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
    if (!user) {
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
      createdBy: user.id,
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

  // Share track functionality
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

  return (
    <TrackContext.Provider value={{
      tracks: state.tracks,
      genres: state.genres,
      addTrack,
      deleteTrack,
      updateTrack,
      addGenre,
      getTracksByGenre: (genreId: string) => getTracksByGenre(state.tracks, state.genres, genreId),
      getTracksByUser: (userId: string) => getTracksByUser(state.tracks, userId),
      likeTrack: (trackId: string) => {
        dispatch({ type: 'LIKE_TRACK', payload: trackId });
        const updatedTracks = state.tracks.map(track => 
          track.id === trackId ? { ...track, likes: track.likes + 1 } : track
        );
        localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
      },
      addComment: (trackId: string, commentData: Omit<Comment, 'id' | 'date'>) => {
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
      },
      getGenreById: (id: string) => getGenreById(state.genres, id),
      currentPlayingTrack: state.currentPlayingTrack,
      setCurrentPlayingTrack: (trackId: string | null) => {
        dispatch({ type: 'SET_CURRENT_PLAYING_TRACK', payload: trackId });
      },
      generateWaveformData,
      shareTrack,
      canEditTrack: (trackId: string) => canEditTrack(state.tracks, user?.id, user?.isAdmin || false, trackId)
    }}>
      {children}
    </TrackContext.Provider>
  );
};

export default TrackContext;
