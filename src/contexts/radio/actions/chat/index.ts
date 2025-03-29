
import { useChatActions as useMessageActions } from './chatActions';
import { useSyncActions } from './syncActions';

export const useChatActions = (state: any, dispatch: React.Dispatch<any>) => {
  const messageActions = useMessageActions(state, dispatch);
  const syncActions = useSyncActions(state, dispatch);
  
  return {
    ...messageActions,
    ...syncActions
  };
};
