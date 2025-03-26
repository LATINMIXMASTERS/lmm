
import React, { useReducer, ReactNode, useEffect } from 'react';
import RadioContext from './RadioContext';
import { radioReducer, initialRadioState, initialStations } from './radioReducer';
import { useRadioActions } from './radioActions';

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialRadioState);
  
  const actions = useRadioActions(state, dispatch);
  
  // Initialize from localStorage or default data
  useEffect(() => {
    // Check if we have stations saved in localStorage
    const savedStations = localStorage.getItem('latinmixmasters_stations');
    if (savedStations) {
      try {
        dispatch({ type: 'SET_STATIONS', payload: JSON.parse(savedStations) });
      } catch (error) {
        console.error("Failed to parse saved stations:", error);
        dispatch({ type: 'SET_STATIONS', payload: initialStations });
        localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
      }
    } else {
      // Initialize with default stations if not in localStorage
      dispatch({ type: 'SET_STATIONS', payload: initialStations });
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(initialStations));
    }
    
    const savedBookings = localStorage.getItem('latinmixmasters_bookings');
    if (savedBookings) {
      try {
        dispatch({ type: 'SET_BOOKINGS', payload: JSON.parse(savedBookings) });
      } catch (error) {
        console.error("Failed to parse saved bookings:", error);
        localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
      }
    } else {
      localStorage.setItem('latinmixmasters_bookings', JSON.stringify([]));
    }

    // Load chat messages from localStorage
    const savedChatMessages = localStorage.getItem('latinmixmasters_chat_messages');
    if (savedChatMessages) {
      try {
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: JSON.parse(savedChatMessages) });
      } catch (error) {
        console.error("Failed to parse saved chat messages:", error);
        localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
      }
    } else {
      localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
    }
    
    // Setup storage sync listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'latinmixmasters_chat_messages' && e.newValue) {
        try {
          dispatch({ type: 'SET_CHAT_MESSAGES', payload: JSON.parse(e.newValue) });
          console.log("Chat messages updated from storage event", new Date().toISOString());
        } catch (error) {
          console.error("Failed to parse updated chat messages:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up periodic sync for chat messages
    const syncInterval = setInterval(() => {
      actions.syncChatMessagesFromStorage?.();
    }, 5000); // Sync every 5 seconds
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [actions]);

  return (
    <RadioContext.Provider value={{
      stations: state.stations,
      bookings: state.bookings,
      currentPlayingStation: state.currentPlayingStation,
      audioState: state.audioState,
      chatMessages: state.chatMessages,
      ...actions
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioProvider;
