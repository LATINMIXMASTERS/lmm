
import { RadioState } from '../types';
import { RadioAction } from '../radioActionTypes';
import { ChatMessage } from '@/models/RadioStation';

// Reducers for chat-related actions
export const chatReducers = {
  addChatMessage: (
    state: RadioState, 
    action: Extract<RadioAction, { type: 'ADD_CHAT_MESSAGE' }>
  ): RadioState => {
    const stationId = action.payload.stationId;
    const currentMessages = state.chatMessages[stationId] || [];
    
    return {
      ...state,
      chatMessages: {
        ...state.chatMessages,
        [stationId]: [...currentMessages, action.payload]
      }
    };
  },
  
  setChatMessages: (
    state: RadioState, 
    action: Extract<RadioAction, { type: 'SET_CHAT_MESSAGES' }>
  ): RadioState => {
    return {
      ...state,
      chatMessages: action.payload
    };
  },
  
  setStationLiveStatus: (
    state: RadioState,
    action: Extract<RadioAction, { type: 'SET_STATION_LIVE_STATUS' }>
  ): RadioState => {
    return {
      ...state,
      stations: state.stations.map(station => {
        if (station.id === action.payload.stationId) {
          return { ...station, isLive: action.payload.isLive };
        }
        return station;
      })
    };
  }
};
