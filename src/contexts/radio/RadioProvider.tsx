
import React, { useReducer, ReactNode, useEffect, useRef } from 'react';
import RadioContext from './RadioContext';
import { radioReducer, initialRadioState, initialStations } from './radioReducer';
import { useRadioActions } from './radioActions';

export const RadioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(radioReducer, initialRadioState);
  const isSyncing = useRef(false);
  
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
    
    // Enhanced storage sync listener for better cross-device communication
    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      
      // Handle chat messages update
      if (e.key === 'latinmixmasters_chat_messages') {
        try {
          const newMessages = JSON.parse(e.newValue);
          // Only update if there's an actual change to prevent loops
          if (JSON.stringify(state.chatMessages) !== e.newValue) {
            dispatch({ type: 'SET_CHAT_MESSAGES', payload: newMessages });
          }
        } catch (error) {
          console.error("Failed to parse updated chat messages:", error);
        }
      }
      
      // Handle stations update (for live status sync)
      else if (e.key === 'latinmixmasters_stations') {
        try {
          const newStations = JSON.parse(e.newValue);
          // Only update if there's an actual change to prevent loops
          if (JSON.stringify(state.stations) !== e.newValue) {
            dispatch({ type: 'SET_STATIONS', payload: newStations });
          }
        } catch (error) {
          console.error("Failed to parse updated stations:", error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Set up periodic sync for chat messages and stations, but with debouncing to prevent infinite loops
    const syncInterval = setInterval(() => {
      if (!isSyncing.current) {
        isSyncing.current = true;
        // Use a setTimeout to stagger the syncs
        setTimeout(() => {
          if (actions.syncChatMessagesFromStorage) {
            actions.syncChatMessagesFromStorage();
          }
          setTimeout(() => {
            if (actions.syncStationsFromStorage) {
              actions.syncStationsFromStorage();
            }
            isSyncing.current = false;
          }, 500);
        }, 0);
      }
    }, 5000); // Sync every 5 seconds
    
    return () => {
      clearInterval(syncInterval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Removed actions from dependency array to prevent infinite loop

  // Prepare the context value with all required properties
  const contextValue = {
    stations: state.stations,
    bookings: state.bookings,
    currentPlayingStation: state.currentPlayingStation,
    audioState: state.audioState,
    chatMessages: state.chatMessages,
    // Make sure to include all the required functions from the RadioContextType
    setStationLiveStatus: actions.setStationLiveStatus,
    toggleChatEnabled: actions.toggleChatEnabled,
    ...actions
  };

  return (
    <RadioContext.Provider value={contextValue}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioProvider;
