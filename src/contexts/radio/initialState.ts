
import { RadioStation, AudioState } from '@/models/RadioStation';
import { RadioState } from './types';

// Initial stations
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
      url: 'https://lmmradiocast.com',
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
      url: 'https://lmmradiocast.com',
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
      url: 'https://lmmradiocast.com',
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
  currentStation: null,
  hasError: false,
  errorMessage: null
};

export const initialRadioState: RadioState = {
  stations: [],
  bookings: [],
  currentPlayingStation: null,
  audioState: initialAudioState,
  chatMessages: {}
};
