
import React, { useReducer, ReactNode } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { trackReducer, initialTrackState } from '@/contexts/track/trackReducer';
import TrackContext from '@/contexts/track/TrackContext';
import TrackProviderEffects from './components/TrackProviderEffects';
import TrackProviderContext from './components/TrackProviderContext';

export const TrackProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trackReducer, initialTrackState);
  const { setCurrentPlayingStation } = useRadio();

  // Handle side effects in a separate component
  const effects = (
    <TrackProviderEffects
      tracks={state.tracks}
      genres={state.genres}
      currentPlayingTrack={state.currentPlayingTrack}
      dispatch={dispatch}
      setCurrentPlayingStation={setCurrentPlayingStation}
    />
  );

  // Get the context value from a separate component
  const contextValue = TrackProviderContext({
    state,
    dispatch,
    setCurrentPlayingStation
  });

  return (
    <TrackContext.Provider value={contextValue}>
      {effects}
      {children}
    </TrackContext.Provider>
  );
};

export default TrackProvider;
