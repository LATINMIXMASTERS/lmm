
import { RadioState } from '../types';
import { RadioAction } from '../radioActionTypes';

// Reducers for audio state-related actions
export const audioStateReducers = {
  setCurrentPlayingStation: (state: RadioState, action: Extract<RadioAction, { type: 'SET_CURRENT_PLAYING_STATION' }>): RadioState => {
    return {
      ...state,
      currentPlayingStation: action.payload
    };
  },
  
  setAudioState: (state: RadioState, action: Extract<RadioAction, { type: 'SET_AUDIO_STATE' }>): RadioState => {
    return {
      ...state,
      audioState: action.payload
    };
  }
};
