
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { RadioStation, BookingSlot } from '@/models/RadioStation';

interface RadioContextType {
  stations: RadioStation[];
  bookings: BookingSlot[];
  getStationById: (id: string) => RadioStation | undefined;
  getBookingsForStation: (stationId: string) => BookingSlot[];
  addBooking: (booking: Omit<BookingSlot, 'id'>) => BookingSlot;
  approveBooking: (bookingId: string) => void;
  updateStreamDetails: (stationId: string, streamDetails: { url: string; port: string; password: string; }) => void;
  currentPlayingStation: string | null;
  setCurrentPlayingStation: (stationId: string | null) => void;
}

const RadioContext = createContext<RadioContextType | undefined>(undefined);

// Initialize with our seven stations
const initialStations: RadioStation[] = [
  {
    id: '1',
    name: 'LMM RADIO',
    genre: 'Latin',
    image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1000&auto=format&fit=crop',
    description: 'The best Latin music mixes.',
    listeners: 120,
    isLive: false
  },
  {
    id: '2',
    name: 'BACHATA RADIO',
    genre: 'Bachata',
    image: 'https://images.unsplash.com/photo-1504647164485-1d91e1d0a112?q=80&w=1000&auto=format&fit=crop',
    description: 'Your go-to station for the best Bachata hits.',
    listeners: 85,
    isLive: false
  },
  {
    id: '3',
    name: 'REGGAETON RADIO',
    genre: 'Reggaeton',
    image: 'https://images.unsplash.com/photo-1526218626217-dc65a29bb444?q=80&w=1000&auto=format&fit=crop',
    description: 'Hottest reggaeton tracks and latest hits.',
    listeners: 210,
    isLive: false
  },
  {
    id: '4',
    name: 'SALSA RADIO',
    genre: 'Salsa',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000&auto=format&fit=crop',
    description: 'Classic and contemporary salsa music.',
    listeners: 95,
    isLive: false
  },
  {
    id: '5',
    name: 'EDM RADIO',
    genre: 'Electronic',
    image: 'https://images.unsplash.com/photo-1571151424566-c2c2b5c8c10c?q=80&w=1000&auto=format&fit=crop',
    description: 'Electronic dance music that keeps you moving.',
    listeners: 178,
    isLive: false
  },
  {
    id: '6',
    name: 'URBAN RADIO',
    genre: 'Urban',
    image: 'https://images.unsplash.com/photo-1499364615650-ec38552f4f34?q=80&w=1000&auto=format&fit=crop',
    description: 'Urban beats and street vibes.',
    listeners: 156,
    isLive: false
  },
  {
    id: '7',
    name: 'LA TOKADA RADIO',
    genre: 'Mix',
    image: 'https://images.unsplash.com/photo-1629276301820-a7e787d5c8b1?q=80&w=1000&auto=format&fit=crop',
    description: 'Eclectic mix of the hottest tracks.',
    listeners: 125,
    isLive: false
  }
];

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [bookings, setBookings] = useState<BookingSlot[]>([]);
  const [currentPlayingStation, setCurrentPlayingStation] = useState<string | null>(null);

  // Initialize stations and bookings from localStorage
  useEffect(() => {
    // Check if we have stations saved in localStorage
    const savedStations = localStorage.getItem('latinmixmasters_stations');
    if (savedStations) {
      setStations(JSON.parse(savedStations));
    } else {
      // Initialize with default stations if not in localStorage
      setStations(initialStations);
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
    }
    
    const savedBookings = localStorage.getItem('latinmixmasters_bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    } else {
      localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
    }
  }, []);

  const getStationById = (id: string) => {
    return stations.find(station => station.id === id);
  };

  const getBookingsForStation = (stationId: string) => {
    return bookings.filter(booking => booking.stationId === stationId);
  };

  const addBooking = (bookingData: Omit<BookingSlot, 'id'>) => {
    const newBooking: BookingSlot = {
      ...bookingData,
      id: Math.random().toString(36).substring(2, 11)
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    return newBooking;
  };

  const approveBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { ...booking, approved: true } : booking
    );
    
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };

  const updateStreamDetails = (stationId: string, streamDetails: { url: string; port: string; password: string; }) => {
    const updatedStations = stations.map(station => 
      station.id === stationId ? { ...station, streamDetails } : station
    );
    
    setStations(updatedStations);
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
  };

  return (
    <RadioContext.Provider value={{
      stations,
      bookings,
      getStationById,
      getBookingsForStation,
      addBooking,
      approveBooking,
      updateStreamDetails,
      currentPlayingStation,
      setCurrentPlayingStation
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadio = () => {
  const context = useContext(RadioContext);
  if (context === undefined) {
    throw new Error('useRadio must be used within a RadioProvider');
  }
  return context;
};

export default RadioContext;
