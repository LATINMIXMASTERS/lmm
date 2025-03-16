
import { createContext } from 'react';
import { Track, Genre, Comment } from '@/models/Track';

export interface TrackContextType {
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

export default TrackContext;
