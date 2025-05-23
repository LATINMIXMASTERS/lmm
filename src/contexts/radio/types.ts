
import { RadioStation, BookingSlot, AudioState, ChatMessage, RadioMetadata } from '@/models/RadioStation';

export interface RadioState {
  stations: RadioStation[];
  bookings: BookingSlot[];
  currentPlayingStation: string | null;
  audioState: AudioState;
  chatMessages: Record<string, ChatMessage[]>; // Indexed by stationId
}

export interface RadioContextType {
  stations: RadioStation[];
  bookings: BookingSlot[];
  getStationById: (id: string) => RadioStation | undefined;
  getBookingsForStation: (stationId: string) => BookingSlot[];
  addBooking: (booking: Omit<BookingSlot, 'id'>) => BookingSlot;
  approveBooking: (bookingId: string) => void;
  rejectBooking: (bookingId: string, reason: string) => void;
  cancelBooking: (bookingId: string) => void;
  updateBooking: (bookingId: string, updatedBooking: Partial<BookingSlot>) => BookingSlot | null;
  updateStreamDetails: (stationId: string, streamDetails: { url: string; port: string; password: string; }) => void;
  updateStreamUrl: (stationId: string, streamUrl: string) => void;
  updateStationImage: (stationId: string, imageUrl: string) => void;
  uploadStationImage: (stationId: string, file: File) => Promise<void>;
  updateStationS3Image: (stationId: string, s3ImageUrl: string) => void;
  updateStationMetadata: (stationId: string, metadata: RadioMetadata) => void;
  updateStationListeners: (stationId: string, listeners: number) => void;
  updateVideoStreamUrl: (stationId: string, videoStreamUrl: string) => void;
  currentPlayingStation: string | null;
  setCurrentPlayingStation: (stationId: string | null) => void;
  hasBookingConflict: (stationId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => boolean;
  getBookingsForToday: (stationId: string) => BookingSlot[];
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
  // Chat related methods
  chatMessages: Record<string, ChatMessage[]>;
  getChatMessagesForStation: (stationId: string) => ChatMessage[];
  sendChatMessage: (stationId: string, message: string) => void;
  setStationLiveStatus: (stationId: string, isLive: boolean, enableChat?: boolean) => void;
  toggleChatEnabled: (stationId: string, enabled: boolean) => void;
  syncChatMessagesFromStorage: () => Record<string, ChatMessage[]>;
  syncFromLocalStorage?: (stationId: string) => any;
  syncToLocalStorage?: (stationId: string) => void;
  handleStorageEvent?: (e: StorageEvent) => void;
  syncStationsFromStorage?: () => void;
  clearChatMessagesForStation: (stationId: string) => void;
}
