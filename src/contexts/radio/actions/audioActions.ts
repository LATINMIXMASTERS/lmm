
import { AudioState } from '@/models/RadioStation';

export const useAudioActions = (
  state: { 
    currentPlayingStation: string | null;
    audioState: AudioState;
  }, 
  dispatch: React.Dispatch<any>
) => {
  const setCurrentPlayingStationImpl = (stationId: string | null) => {
    // Update station first, then update audio state with appropriate flags
    dispatch({ type: 'SET_CURRENT_PLAYING_STATION', payload: stationId });
    
    // Clear any false error states when switching stations
    if (stationId !== state.currentPlayingStation) {
      dispatch({ 
        type: 'SET_AUDIO_STATE', 
        payload: { 
          ...state.audioState,
          isPlaying: true, // Set to true when switching stations
          hasError: false, // Clear any error state
          errorMessage: null,
          currentStation: stationId,
          currentTrack: null 
        }
      });
    }
  };
  
  const setAudioStateImpl = (newState: React.SetStateAction<AudioState>) => {
    const updatedState = typeof newState === 'function' 
      ? newState(state.audioState) 
      : newState;
    
    dispatch({ type: 'SET_AUDIO_STATE', payload: updatedState });
  };

  return {
    setCurrentPlayingStation: setCurrentPlayingStationImpl,
    setAudioState: setAudioStateImpl
  };
};
