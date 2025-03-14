
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { RadioStation, BookingSlot, FileUpload } from '@/models/RadioStation';
import { isAfter, isBefore, format, isToday } from 'date-fns';

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

  const getBookingsForToday = (stationId: string) => {
    return bookings.filter(booking => 
      booking.stationId === stationId && 
      isToday(new Date(booking.startTime))
    );
  };

  const hasBookingConflict = (stationId: string, startTime: Date, endTime: Date, excludeBookingId?: string) => {
    const stationBookings = getBookingsForStation(stationId)
      .filter(booking => booking.id !== excludeBookingId && !booking.rejected);
    
    return stationBookings.some(booking => {
      const bookingStart = new Date(booking.startTime);
      const bookingEnd = new Date(booking.endTime);
      
      return (
        (isAfter(startTime, bookingStart) && isBefore(startTime, bookingEnd)) ||
        (isAfter(endTime, bookingStart) && isBefore(endTime, bookingEnd)) ||
        (isBefore(startTime, bookingStart) && isAfter(endTime, bookingEnd)) ||
        (startTime.getTime() === bookingStart.getTime()) ||
        (endTime.getTime() === bookingEnd.getTime())
      );
    });
  };

  const addBooking = (bookingData: Omit<BookingSlot, 'id'>) => {
    const bookingId = Math.random().toString(36).substring(2, 11);
    
    // Check for conflicts
    const hasConflict = hasBookingConflict(
      bookingData.stationId, 
      new Date(bookingData.startTime), 
      new Date(bookingData.endTime)
    );
    
    // Auto-approve if no conflicts and user is admin, otherwise pending approval
    const autoApprove = bookingData.approved || !hasConflict;
    
    const newBooking: BookingSlot = {
      ...bookingData,
      id: bookingId,
      approved: autoApprove,
      rejected: hasConflict ? true : false,
      rejectionReason: hasConflict ? 'Conflicting time slot with an existing booking' : undefined
    };
    
    const updatedBookings = [...bookings, newBooking];
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    return newBooking;
  };

  const approveBooking = (bookingId: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: true, 
        rejected: false,
        rejectionReason: undefined 
      } : booking
    );
    
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };

  const rejectBooking = (bookingId: string, reason: string) => {
    const updatedBookings = bookings.map(booking => 
      booking.id === bookingId ? { 
        ...booking, 
        approved: false, 
        rejected: true,
        rejectionReason: reason 
      } : booking
    );
    
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
  };

  const cancelBooking = (bookingId: string) => {
    const updatedBookings = bookings.filter(booking => booking.id !== bookingId);
    
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been canceled`);
  };

  const updateBooking = (bookingId: string, updatedBookingData: Partial<BookingSlot>) => {
    const bookingIndex = bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) {
      console.error(`Booking with ID ${bookingId} not found`);
      return null;
    }
    
    // If start or end time is being updated, check for conflicts
    if (updatedBookingData.startTime || updatedBookingData.endTime) {
      const booking = bookings[bookingIndex];
      const stationId = booking.stationId;
      const startTime = updatedBookingData.startTime 
        ? new Date(updatedBookingData.startTime) 
        : new Date(booking.startTime);
      const endTime = updatedBookingData.endTime 
        ? new Date(updatedBookingData.endTime) 
        : new Date(booking.endTime);
      
      const hasConflict = hasBookingConflict(stationId, startTime, endTime, bookingId);
      
      if (hasConflict) {
        console.error('Time slot conflict detected');
        return null;
      }
    }
    
    const updatedBookings = bookings.map((booking, index) => {
      if (index === bookingIndex) {
        return { ...booking, ...updatedBookingData };
      }
      return booking;
    });
    
    setBookings(updatedBookings);
    localStorage.setItem('latinmixmasters_bookings', JSON.stringify(updatedBookings));
    
    console.log(`Booking ${bookingId} has been updated:`, updatedBookings[bookingIndex]);
    return updatedBookings[bookingIndex];
  };

  const updateStreamDetails = (stationId: string, streamDetails: { url: string; port: string; password: string; }) => {
    // Ensure the URL has the proper format for streaming
    let formattedUrl = streamDetails.url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    const updatedStations = stations.map(station => 
      station.id === stationId ? { 
        ...station, 
        streamDetails: { 
          ...streamDetails, 
          url: formattedUrl 
        }
      } : station
    );
    
    setStations(updatedStations);
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated stream details for station ${stationId}:`, { ...streamDetails, url: formattedUrl });
  };
  
  const updateStreamUrl = (stationId: string, streamUrl: string) => {
    let formattedUrl = streamUrl;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    const updatedStations = stations.map(station => {
      if (station.id === stationId) {
        return { 
          ...station, 
          streamUrl: formattedUrl 
        };
      }
      return station;
    });
    
    setStations(updatedStations);
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated player stream URL for station ${stationId}:`, formattedUrl);
  };

  const updateStationImage = (stationId: string, imageUrl: string) => {
    if (!imageUrl.trim()) return;
    
    const updatedStations = stations.map(station => {
      if (station.id === stationId) {
        return { ...station, image: imageUrl };
      }
      return station;
    });
    
    setStations(updatedStations);
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated station image for station ${stationId}:`, imageUrl);
  };

  const uploadStationImage = async (stationId: string, file: File): Promise<void> => {
    if (!file) return;
    
    return new Promise((resolve, reject) => {
      try {
        // Read the file and convert to data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          
          // Update the station with the data URL
          const updatedStations = stations.map(station => {
            if (station.id === stationId) {
              return { ...station, image: dataUrl };
            }
            return station;
          });
          
          setStations(updatedStations);
          localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
          
          console.log(`Uploaded image for station ${stationId}`);
          resolve();
        };
        
        reader.onerror = () => {
          console.error("Error reading file");
          reject(new Error("Failed to read file"));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        reject(error);
      }
    });
  };

  return (
    <RadioContext.Provider value={{
      stations,
      bookings,
      getStationById,
      getBookingsForStation,
      addBooking,
      approveBooking,
      rejectBooking,
      cancelBooking,
      updateBooking,
      updateStreamDetails,
      updateStreamUrl,
      updateStationImage,
      uploadStationImage,
      currentPlayingStation,
      setCurrentPlayingStation,
      hasBookingConflict,
      getBookingsForToday
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
