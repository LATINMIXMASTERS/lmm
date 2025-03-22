
import { RadioState } from './types';
import { RadioAction } from './radioActionTypes';
import { initialRadioState, initialStations } from './initialState';
import { stationReducers } from './reducers/stationReducers';
import { bookingReducers } from './reducers/bookingReducers';
import { audioStateReducers } from './reducers/audioStateReducers';
import { chatReducers } from './reducers/chatReducers';

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
    
    case 'UPDATE_STATION_S3_IMAGE':
      return stationReducers.updateStationS3Image(state, action);
      
    case 'UPDATE_STATION_METADATA':
      return stationReducers.updateStationMetadata(state, action);
      
    case 'UPDATE_STATION_LISTENERS':
      return stationReducers.updateStationListeners(state, action);
    
    case 'SET_STATION_LIVE_STATUS':
      return chatReducers.setStationLiveStatus(state, action);
    
    case 'TOGGLE_CHAT_ENABLED':
      return chatReducers.toggleChatEnabled(state, action);
    
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
    
    // Chat reducers
    case 'ADD_CHAT_MESSAGE':
      return chatReducers.addChatMessage(state, action);
    
    case 'SET_CHAT_MESSAGES':
      return chatReducers.setChatMessages(state, action);
    
    default:
      return state;
  }
};
