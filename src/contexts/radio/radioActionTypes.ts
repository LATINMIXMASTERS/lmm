
import { RadioStation, BookingSlot, AudioState, ChatMessage, RadioMetadata } from '@/models/RadioStation';

// Action types for the radio reducer
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
  | { type: 'SET_AUDIO_STATE'; payload: AudioState }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'SET_CHAT_MESSAGES'; payload: Record<string, ChatMessage[]> }
  | { type: 'SET_STATION_LIVE_STATUS'; payload: { stationId: string, isLive: boolean, chatEnabled: boolean } }
  | { type: 'TOGGLE_CHAT_ENABLED'; payload: { stationId: string, enabled: boolean } }
  | { type: 'UPDATE_STATION_METADATA'; payload: { stationId: string, metadata: RadioMetadata } }
  | { type: 'UPDATE_STATION_S3_IMAGE'; payload: { stationId: string, s3ImageUrl: string } }
  | { type: 'UPDATE_STATION_LISTENERS'; payload: { stationId: string, listeners: number } };
