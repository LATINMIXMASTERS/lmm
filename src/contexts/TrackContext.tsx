import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { Track, Genre, Comment } from '@/models/Track';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './AuthContext';
import { useRadio } from './RadioContext';

interface TrackContextType {
  tracks: Track[];
  genres: Genre[];
  addTrack: (track: Omit<Track, 'id' | 'likes' | 'uploadDate'>) => Track;
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
}

const TrackContext = createContext<TrackContextType | undefined>(undefined);

// Some sample genres to start with
const initialGenres: Genre[] = [
  {
    id: '1',
    name: 'Reggaeton',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Bachata',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Salsa',
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];

export const TrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentPlayingStation } = useRadio();

  // Initialize from localStorage
  useEffect(() => {
    const savedTracks = localStorage.getItem('latinmixmasters_tracks');
    if (savedTracks) {
      setTracks(JSON.parse(savedTracks));
    }
    
    const savedGenres = localStorage.getItem('latinmixmasters_genres');
    if (savedGenres) {
      setGenres(JSON.parse(savedGenres));
    } else {
      setGenres(initialGenres);
      localStorage.setItem('latinmixmasters_genres', JSON.stringify(initialGenres));
    }
  }, []);

  // When a track is selected for playing, stop station streams
  useEffect(() => {
    if (currentPlayingTrack) {
      setCurrentPlayingStation(null);
    }
  }, [currentPlayingTrack, setCurrentPlayingStation]);

  // Generate mock waveform data for visualization
  const generateWaveformData = () => {
    return Array.from({ length: 40 }, () => Math.floor(Math.random() * 95) + 5);
  };

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
    
    const updatedTracks = [...tracks, newTrack];
    setTracks(updatedTracks);
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
    
    toast({
      title: "Track uploaded",
      description: "Your track has been successfully uploaded",
    });
    
    return newTrack;
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

    if (genres.some(g => g.name.toLowerCase() === genreName.toLowerCase())) {
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
    
    const updatedGenres = [...genres, newGenre];
    setGenres(updatedGenres);
    localStorage.setItem('latinmixmasters_genres', JSON.stringify(updatedGenres));
    
    toast({
      title: "Genre added",
      description: `The genre "${genreName}" has been added`,
    });
    
    return newGenre;
  };

  // Get tracks by genre
  const getTracksByGenre = (genreId: string) => {
    const genre = genres.find(g => g.id === genreId);
    if (!genre) return [];
    
    return tracks.filter(track => track.genre === genre.name);
  };

  // Get tracks by user
  const getTracksByUser = (userId: string) => {
    return tracks.filter(track => track.uploadedBy === userId);
  };

  // Like a track
  const likeTrack = (trackId: string) => {
    const updatedTracks = tracks.map(track => 
      track.id === trackId ? { ...track, likes: track.likes + 1 } : track
    );
    
    setTracks(updatedTracks);
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
  };

  // Add comment to a track
  const addComment = (trackId: string, commentData: Omit<Comment, 'id' | 'date'>) => {
    const newComment: Comment = {
      ...commentData,
      id: Math.random().toString(36).substring(2, 11),
      date: new Date().toISOString()
    };
    
    const updatedTracks = tracks.map(track => {
      if (track.id === trackId) {
        const comments = track.comments || [];
        return {
          ...track,
          comments: [...comments, newComment]
        };
      }
      return track;
    });
    
    setTracks(updatedTracks);
    localStorage.setItem('latinmixmasters_tracks', JSON.stringify(updatedTracks));
  };

  // Get genre by ID
  const getGenreById = (id: string) => {
    return genres.find(genre => genre.id === id);
  };

  // Share track functionality
  const shareTrack = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;
    
    const shareUrl = `${window.location.origin}/mixes?track=${trackId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${track.artist} - ${track.title}`,
        text: 'Check out this awesome mix on Latin Mix Masters!',
        url: shareUrl,
      }).catch((error) => {
        console.log('Error sharing', error);
        copyToClipboard(shareUrl);
      });
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Link copied!",
        description: "Share link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive"
      });
    });
  };

  return (
    <TrackContext.Provider value={{
      tracks,
      genres,
      addTrack,
      addGenre,
      getTracksByGenre,
      getTracksByUser,
      likeTrack,
      addComment,
      getGenreById,
      currentPlayingTrack,
      setCurrentPlayingTrack,
      generateWaveformData,
      shareTrack
    }}>
      {children}
    </TrackContext.Provider>
  );
};

export const useTrack = () => {
  const context = useContext(TrackContext);
  if (context === undefined) {
    throw new Error('useTrack must be used within a TrackProvider');
  }
  return context;
};

export default TrackContext;
