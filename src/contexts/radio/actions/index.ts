
import { useStationActions } from './stationActions';
import { useStationQueries } from './stationQueries';
import { useBookingActions } from './bookingActions';
import { useAudioActions } from './audioActions';
import { useChatActions } from './chat';

export const useRadioActions = (state: any, dispatch: React.Dispatch<any>) => {
  const stationActions = useStationActions(state, dispatch);
  const stationQueries = useStationQueries(state);
  const bookingActions = useBookingActions(state, dispatch);
  const audioActions = useAudioActions(state, dispatch);
  const chatActions = useChatActions(state, dispatch);

  return {
    ...stationActions,
    ...stationQueries,
    ...bookingActions,
    ...audioActions,
    ...chatActions
  };
};
