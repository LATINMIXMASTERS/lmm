
import { Track, Genre, Comment } from '@/models/Track';

// Action types
export type TrackAction = 
  | { type: 'SET_TRACKS'; payload: Track[] }
  | { type: 'SET_GENRES'; payload: Genre[] }
  | { type: 'ADD_TRACK'; payload: Track }
  | { type: 'DELETE_TRACK'; payload: string }
  | { type: 'UPDATE_TRACK'; payload: { trackId: string; trackData: Partial<Track> } }
  | { type: 'ADD_GENRE'; payload: Genre }
  | { type: 'LIKE_TRACK'; payload: string }
  | { type: 'ADD_COMMENT'; payload: { trackId: string; comment: Comment } }
  | { type: 'SET_CURRENT_PLAYING_TRACK'; payload: string | null };

export type TrackState = {
  tracks: Track[];
  genres: Genre[];
  currentPlayingTrack: string | null;
};

export const initialGenres: Genre[] = [
  {
    id: '1',
    name: 'Reggaeton',
    count: 24,
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Bachata',
    count: 18,
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Salsa',
    count: 15,
    createdBy: 'admin',
    createdAt: new Date().toISOString()
  }
];

export const initialTrackState: TrackState = {
  tracks: [],
  genres: [],
  currentPlayingTrack: null
};

export const trackReducer = (state: TrackState, action: TrackAction): TrackState => {
  switch (action.type) {
    case 'SET_TRACKS':
      return {
        ...state,
        tracks: action.payload
      };
    case 'SET_GENRES':
      return {
        ...state,
        genres: action.payload
      };
    case 'ADD_TRACK':
      return {
        ...state,
        tracks: [...state.tracks, action.payload]
      };
    case 'DELETE_TRACK':
      return {
        ...state,
        tracks: state.tracks.filter(track => track.id !== action.payload),
        currentPlayingTrack: state.currentPlayingTrack === action.payload ? null : state.currentPlayingTrack
      };
    case 'UPDATE_TRACK':
      return {
        ...state,
        tracks: state.tracks.map(track => 
          track.id === action.payload.trackId
            ? { ...track, ...action.payload.trackData, id: track.id, uploadDate: track.uploadDate, uploadedBy: track.uploadedBy }
            : track
        )
      };
    case 'ADD_GENRE':
      return {
        ...state,
        genres: [...state.genres, action.payload]
      };
    case 'LIKE_TRACK':
      return {
        ...state,
        tracks: state.tracks.map(track => 
          track.id === action.payload 
            ? { ...track, likes: track.likes + 1 } 
            : track
        )
      };
    case 'ADD_COMMENT':
      return {
        ...state,
        tracks: state.tracks.map(track => {
          if (track.id === action.payload.trackId) {
            const comments = track.comments || [];
            return {
              ...track,
              comments: [...comments, action.payload.comment]
            };
          }
          return track;
        })
      };
    case 'SET_CURRENT_PLAYING_TRACK':
      return {
        ...state,
        currentPlayingTrack: action.payload
      };
    default:
      return state;
  }
};
