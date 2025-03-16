
import { RadioState } from '../types';
import { useStationActions } from './stationActions';
import { useBookingActions } from './bookingActions';
import { useAudioActions } from './audioActions';
import { useStationQueries } from './stationQueries';

export const useRadioActions = (
  state: RadioState,
  dispatch: React.Dispatch<any>
) => {
  // Initialize all action hooks
  const stationActions = useStationActions(state, dispatch);
  const bookingActions = useBookingActions(state, dispatch);
  const audioActions = useAudioActions(state, dispatch);
  const stationQueries = useStationQueries(state);

  // Combine all actions into a single object
  return {
    ...stationActions,
    ...bookingActions,
    ...audioActions,
    ...stationQueries
  };
};
