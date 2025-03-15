
import { Track, Genre, Comment } from '@/models/Track';

// Generate mock waveform data for visualization
export const generateWaveformData = (): number[] => {
  return Array.from({ length: 40 }, () => Math.floor(Math.random() * 95) + 5);
};

// Helper to get tracks by genre
export const getTracksByGenre = (tracks: Track[], genres: Genre[], genreId: string): Track[] => {
  const genre = genres.find(g => g.id === genreId);
  if (!genre) return [];
  return tracks.filter(track => track.genre === genre.name);
};

// Helper to get tracks by user
export const getTracksByUser = (tracks: Track[], userId: string): Track[] => {
  return tracks.filter(track => track.uploadedBy === userId);
};

// Helper to get genre by ID
export const getGenreById = (genres: Genre[], id: string): Genre | undefined => {
  return genres.find(genre => genre.id === id);
};

// Helper to check if a user can edit a track
export const canEditTrack = (tracks: Track[], userId: string | undefined, isAdmin: boolean, trackId: string): boolean => {
  if (!userId) return false;
  
  const track = tracks.find(t => t.id === trackId);
  if (!track) return false;
  
  return isAdmin || track.uploadedBy === userId;
};

// Copy to clipboard helper
export const copyToClipboard = (text: string): Promise<void> => {
  return navigator.clipboard.writeText(text);
};
