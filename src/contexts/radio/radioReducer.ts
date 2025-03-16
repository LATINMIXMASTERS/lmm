
import { RadioState } from './types';
import { RadioAction } from './radioActionTypes';
import { initialRadioState, initialStations } from './initialState';
import { stationReducers } from './reducers/stationReducers';
import { bookingReducers } from './reducers/bookingReducers';
import { audioStateReducers } from './reducers/audioStateReducers';

export { initialRadioState, initialStations };

export const radioReducer = (state: RadioState, action: RadioAction): RadioState => {
  switch (action.type) {
    // Station reducers
    case 'SET_STATIONS':
      return stationReducers.setStations(state, action);
    
    case 'UPDATE_STREAM_DETAILS':
      return stationReducers.updateStreamDetails(state, action);
    
    case 'UPDATE_STREAM_URL':
      return stationReducers.updateStreamUrl(state, action);
    
    case 'UPDATE_STATION_IMAGE':
      return stationReducers.updateStationImage(state, action);
    
    // Booking reducers
    case 'SET_BOOKINGS':
      return bookingReducers.setBookings(state, action);
    
    case 'ADD_BOOKING':
      return bookingReducers.addBooking(state, action);
    
    case 'UPDATE_BOOKING':
      return bookingReducers.updateBooking(state, action);
    
    case 'DELETE_BOOKING':
      return bookingReducers.deleteBooking(state, action);
    
    case 'APPROVE_BOOKING':
      return bookingReducers.approveBooking(state, action);
    
    case 'REJECT_BOOKING':
      return bookingReducers.rejectBooking(state, action);
    
    // Audio state reducers
    case 'SET_CURRENT_PLAYING_STATION':
      return audioStateReducers.setCurrentPlayingStation(state, action);
    
    case 'SET_AUDIO_STATE':
      return audioStateReducers.setAudioState(state, action);
    
    default:
      return state;
  }
};
