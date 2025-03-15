
import { RadioStation, BookingSlot, AudioState } from '@/models/RadioStation';
import { formatStreamUrl } from '@/utils/radioUtils';

// Action types
export type RadioAction = 
  | { type: 'SET_STATIONS'; payload: RadioStation[] }
  | { type: 'SET_BOOKINGS'; payload: BookingSlot[] }
  | { type: 'ADD_BOOKING'; payload: BookingSlot }
  | { type: 'UPDATE_BOOKING'; payload: BookingSlot }
  | { type: 'DELETE_BOOKING'; payload: string }
  | { type: 'APPROVE_BOOKING'; payload: string }
  | { type: 'REJECT_BOOKING'; payload: { bookingId: string, reason: string } }
  | { type: 'UPDATE_STREAM_DETAILS'; payload: { stationId: string, streamDetails: { url: string; port: string; password: string } } }
  | { type: 'UPDATE_STREAM_URL'; payload: { stationId: string, streamUrl: string } }
  | { type: 'UPDATE_STATION_IMAGE'; payload: { stationId: string, imageUrl: string } }
  | { type: 'SET_CURRENT_PLAYING_STATION'; payload: string | null }
  | { type: 'SET_AUDIO_STATE'; payload: AudioState };

export type RadioState = {
  stations: RadioStation[];
  bookings: BookingSlot[];
  currentPlayingStation: string | null;
  audioState: AudioState;
};

// Initial stations (moved from context to reducer)
export const initialStations: RadioStation[] = [
  {
    id: '1',
    name: 'LMM RADIO',
    genre: 'Latin',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop',
    description: 'The best Latin music mixes.',
    listeners: 120,
    isLive: false,
    streamDetails: {
      url: 'https://lmmradiocast.com/lmmradio',
      port: '8000',
      password: 'demo123'
    },
    streamUrl: 'https://lmmradiocast.com/lmmradio',
    hosts: ['host1', 'host2'],
    broadcastTime: 'Weekdays 6PM-10PM'
  },
  {
    id: '2',
    name: 'BACHATA RADIO',
    genre: 'Bachata',
    image: 'https://images.unsplash.com/photo-1504647164485-1d91e1d0a112?q=80&w=1000&auto=format&fit=crop',
    description: 'Your go-to station for the best Bachata hits.',
    listeners: 85,
    isLive: false,
    streamDetails: {
      url: 'https://lmmradiocast.com/bachataradio',
      port: '8000',
      password: 'demo123'
    },
    streamUrl: 'https://lmmradiocast.com/bachataradio',
    hosts: ['host3'],
    broadcastTime: 'Weekends 2PM-6PM'
  },
  {
    id: '3',
    name: 'REGGAETON RADIO',
    genre: 'Reggaeton',
    image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=1000&auto=format&fit=crop',
    description: 'Hottest reggaeton tracks and latest hits.',
    listeners: 210,
    isLive: false,
    streamDetails: {
      url: 'https://lmmradiocast.com/reggaetonradio',
      port: '8000',
      password: 'demo123'
    },
    streamUrl: 'https://lmmradiocast.com/reggaetonradio',
    hosts: ['host2', 'host4'],
    broadcastTime: 'Daily 8PM-12AM'
  },
  {
    id: '4',
    name: 'SALSA RADIO',
    genre: 'Salsa',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop',
    description: 'Classic and contemporary salsa music.',
    listeners: 95,
    isLive: false,
    streamUrl: 'https://lmmradiocast.com/salsaradio'
  },
  {
    id: '5',
    name: 'EDM RADIO',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1571151424566-c2c2b5c8c10c?q=80&w=1000&auto=format&fit=crop',
    description: 'Electronic dance music that keeps you moving.',
    listeners: 178,
    isLive: false,
    streamUrl: 'https://lmmradiocast.com/edmradio'
  },
  {
    id: '6',
    name: 'URBAN RADIO',
    genre: 'Urban',
    image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=1000&auto=format&fit=crop',
    description: 'Urban beats and street vibes.',
    listeners: 156,
    isLive: false,
    streamUrl: 'https://lmmradiocast.com/urbanradio'
  },
  {
    id: '7',
    name: 'LA TOKADA RADIO',
    genre: 'Mix',
    image: 'https://images.unsplash.com/photo-1629276301820-a7e787d5c8b1?q=80&w=1000&auto=format&fit=crop',
    description: 'Eclectic mix of the hottest tracks.',
    listeners: 125,
    isLive: false,
    streamUrl: 'https://lmmradiocast.com/latokadaradio'
  }
];

// Initial audio state
export const initialAudioState: AudioState = {
  isPlaying: false,
  volume: 80,
  isMuted: false,
  currentTrack: null,
  currentStation: null
};

export const initialRadioState: RadioState = {
  stations: [],
  bookings: [],
  currentPlayingStation: null,
  audioState: initialAudioState
};

export const radioReducer = (state: RadioState, action: RadioAction): RadioState => {
  switch (action.type) {
    case 'SET_STATIONS':
      return {
        ...state,
        stations: action.payload
      };
    
    case 'SET_BOOKINGS':
      return {
        ...state,
        bookings: action.payload
      };
    
    case 'ADD_BOOKING':
      return {
        ...state,
        bookings: [...state.bookings, action.payload]
      };
    
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking => 
          booking.id === action.payload.id ? action.payload : booking
        )
      };
    
    case 'DELETE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.filter(booking => booking.id !== action.payload)
      };
    
    case 'APPROVE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking => 
          booking.id === action.payload 
            ? { ...booking, approved: true, rejected: false, rejectionReason: undefined } 
            : booking
        )
      };
    
    case 'REJECT_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(booking => 
          booking.id === action.payload.bookingId 
            ? { ...booking, approved: false, rejected: true, rejectionReason: action.payload.reason } 
            : booking
        )
      };
    
    case 'UPDATE_STREAM_DETAILS':
      return {
        ...state,
        stations: state.stations.map(station => 
          station.id === action.payload.stationId 
            ? { 
                ...station, 
                streamDetails: { 
                  ...action.payload.streamDetails,
                  url: formatStreamUrl(action.payload.streamDetails.url)
                } 
              } 
            : station
        )
      };
    
    case 'UPDATE_STREAM_URL':
      return {
        ...state,
        stations: state.stations.map(station => 
          station.id === action.payload.stationId 
            ? { ...station, streamUrl: formatStreamUrl(action.payload.streamUrl) } 
            : station
        )
      };
    
    case 'UPDATE_STATION_IMAGE':
      return {
        ...state,
        stations: state.stations.map(station => 
          station.id === action.payload.stationId 
            ? { ...station, image: action.payload.imageUrl } 
            : station
        )
      };
    
    case 'SET_CURRENT_PLAYING_STATION':
      return {
        ...state,
        currentPlayingStation: action.payload
      };
    
    case 'SET_AUDIO_STATE':
      return {
        ...state,
        audioState: action.payload
      };
    
    default:
      return state;
  }
};
