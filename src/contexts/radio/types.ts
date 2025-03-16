
import { RadioStation, BookingSlot, AudioState } from '@/models/RadioStation';

export interface RadioState {
  stations: RadioStation[];
  bookings: BookingSlot[];
  currentPlayingStation: string | null;
  audioState: AudioState;
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
  currentPlayingStation: string | null;
  setCurrentPlayingStation: (stationId: string | null) => void;
  hasBookingConflict: (stationId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => boolean;
  getBookingsForToday: (stationId: string) => BookingSlot[];
  audioState: AudioState;
  setAudioState: React.Dispatch<React.SetStateAction<AudioState>>;
}
