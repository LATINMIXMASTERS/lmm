
import { RadioState } from './types';
import { useRadioActions as useModularRadioActions } from './actions';

export const useRadioActions = (
  state: RadioState, 
  dispatch: React.Dispatch<any>
) => {
  return useModularRadioActions(state, dispatch);
};
