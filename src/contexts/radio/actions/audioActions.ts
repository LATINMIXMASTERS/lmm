
import { AudioState } from '@/models/RadioStation';

export const useAudioActions = (
  state: { 
    currentPlayingStation: string | null;
    audioState: AudioState;
  }, 
  dispatch: React.Dispatch<any>
) => {
  const setCurrentPlayingStationImpl = (stationId: string | null) => {
    dispatch({ type: 'SET_CURRENT_PLAYING_STATION', payload: stationId });
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
