
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

  return (
    <RadioContext.Provider value={{
      stations: state.stations,
      bookings: state.bookings,
      currentPlayingStation: state.currentPlayingStation,
      audioState: state.audioState,
      ...actions
    }}>
      {children}
    </RadioContext.Provider>
  );
};

export default RadioProvider;
