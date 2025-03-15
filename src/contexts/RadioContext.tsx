
import React, { createContext, useReducer, ReactNode, useEffect } from 'react';
import { RadioStation, BookingSlot, AudioState } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';

import { radioReducer, initialRadioState, initialStations } from './radio/radioReducer';
import { 
  getStationById, 
  getBookingsForStation, 
  getBookingsForToday, 
  hasBookingConflict, 
  formatStreamUrl 
} from '@/utils/radioUtils';
import { createBooking, canUpdateBooking } from '@/services/bookingService';
import { validateImageFile, fileToDataUrl } from '@/services/imageUploadService';

interface RadioContextType {
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

const RadioContext = createContext<RadioContextType | undefined>(undefined);

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [state, dispatch] = useReducer(radioReducer, initialRadioState);
  
  // Initialize from localStorage or default data
  useEffect(() => {
    // Check if we have stations saved in localStorage
    const savedStations = localStorage.getItem('latinmixmasters_stations');
    if (savedStations) {
      dispatch({ type: 'SET_STATIONS', payload: JSON.parse(savedStations) });
    } else {
      // Initialize with default stations if not in localStorage
      dispatch({ type: 'SET_STATIONS', payload: initialStations });
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
    }
    
    const savedBookings = localStorage.getItem('latinmixmasters_bookings');
    if (savedBookings) {
      dispatch({ type: 'SET_BOOKINGS', payload: JSON.parse(savedBookings) });
    } else {
      localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
    }
  }, []);
  
  // Context methods
  const getStationByIdImpl = (id: string) => getStationById(state.stations, id);
  
  const getBookingsForStationImpl = (stationId: string) => getBookingsForStation(state.bookings, stationId);
  
  const getBookingsForTodayImpl = (stationId: string) => getBookingsForToday(state.bookings, stationId);
  
  const hasBookingConflictImpl = (stationId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => {
    return hasBookingConflict(state.bookings, stationId, startTime, endTime, excludeBookingId);
  };
  
  const addBookingImpl = (bookingData: Omit<BookingSlot, 'id'>) => {
    const newBooking = createBooking(state.bookings, bookingData);
    
    // Update state
    dispatch({ type: 'ADD_BOOKING', payload: newBooking });
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify([...state.bookings, newBooking]));
    
    return newBooking;
  };
  
  const approveBookingImpl = (bookingId: string) => {
    dispatch({ type: 'APPROVE_BOOKING', payload: bookingId });
    
    const updatedBookings = state.bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: true, 
        rejected: false,
        rejectionReason: undefined 
      } : booking
    );
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };
  
  const rejectBookingImpl = (bookingId: string, reason: string) => {
    dispatch({ type: 'REJECT_BOOKING', payload: { bookingId, reason } });
    
    const updatedBookings = state.bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: false, 
        rejected: true,
        rejectionReason: reason 
      } : booking
    );
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };
  
  const cancelBookingImpl = (bookingId: string) => {
    dispatch({ type: 'DELETE_BOOKING', payload: bookingId });
    
    const updatedBookings = state.bookings.filter(booking => booking.id !== bookingId);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been canceled`);
  };
  
  const updateBookingImpl = (bookingId: string, updatedBookingData: Partial<BookingSlot>) => {
    if (!canUpdateBooking(state.bookings, bookingId, updatedBookingData)) {
      return null;
    }
    
    const bookingIndex = state.bookings.findIndex(booking => booking.id === bookingId);
    const updatedBooking = { ...state.bookings[bookingIndex], ...updatedBookingData };
    
    dispatch({ type: 'UPDATE_BOOKING', payload: updatedBooking });
    
    const updatedBookings = state.bookings.map((booking, index) => {
      if (index === bookingIndex) {
        return updatedBooking;
      }
      return booking;
    });
    
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been updated:`, updatedBooking);
    return updatedBooking;
  };
  
  const updateStreamDetailsImpl = (stationId: string, streamDetails: { url: string; port: string; password: string; }) => {
    dispatch({ 
      type: 'UPDATE_STREAM_DETAILS', 
      payload: { stationId, streamDetails } 
    });
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId ? { 
        ...station, 
        streamDetails: { 
          ...streamDetails, 
          url: formatStreamUrl(streamDetails.url) 
        }
      } : station
    );
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated stream details for station ${stationId}:`, { 
      ...streamDetails, 
      url: formatStreamUrl(streamDetails.url) 
    });
  };
  
  const updateStreamUrlImpl = (stationId: string, streamUrl: string) => {
    dispatch({ 
      type: 'UPDATE_STREAM_URL', 
      payload: { stationId, streamUrl } 
    });
    
    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { 
          ...station, 
          streamUrl: formatStreamUrl(streamUrl) 
        };
      }
      return station;
    });
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated player stream URL for station ${stationId}:`, formatStreamUrl(streamUrl));
  };
  
  const updateStationImageImpl = (stationId: string, imageUrl: string) => {
    if (!imageUrl.trim()) return;
    
    dispatch({ 
      type: 'UPDATE_STATION_IMAGE', 
      payload: { stationId, imageUrl } 
    });
    
    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, image: imageUrl };
      }
      return station;
    });
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated station image for station ${stationId}:`, imageUrl);
  };
  
  const uploadStationImageImpl = async (stationId: string, file: File): Promise<void> => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const dataUrl = await fileToDataUrl(file);
      
      // Update the station with the data URL
      updateStationImageImpl(stationId, dataUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Station cover image has been updated successfully"
      });
      
      console.log(`Uploaded image for station ${stationId}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
      throw error;
    }
  };
  
  const setCurrentPlayingStationImpl = (stationId: string | null) => {
    dispatch({ type: 'SET_CURRENT_PLAYING_STATION', payload: stationId });
  };
  
  const setAudioStateImpl = (newState: React.SetStateAction<AudioState>) => {
    const updatedState = typeof newState === 'function' 
      ? newState(state.audioState) 
      : newState;
    
    dispatch({ type: 'SET_AUDIO_STATE', payload: updatedState });
  };

  return (
    <RadioContext.Provider value={{
      stations: state.stations,
      bookings: state.bookings,
      getStationById: getStationByIdImpl,
      getBookingsForStation: getBookingsForStationImpl,
      addBooking: addBookingImpl,
      approveBooking: approveBookingImpl,
      rejectBooking: rejectBookingImpl,
      cancelBooking: cancelBookingImpl,
      updateBooking: updateBookingImpl,
      updateStreamDetails: updateStreamDetailsImpl,
      updateStreamUrl: updateStreamUrlImpl,
      updateStationImage: updateStationImageImpl,
      uploadStationImage: uploadStationImageImpl,
      currentPlayingStation: state.currentPlayingStation,
      setCurrentPlayingStation: setCurrentPlayingStationImpl,
      hasBookingConflict: hasBookingConflictImpl,
      getBookingsForToday: getBookingsForTodayImpl,
      audioState: state.audioState,
      setAudioState: setAudioStateImpl
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioContext;
