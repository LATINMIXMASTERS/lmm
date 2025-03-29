
import { useMessageActions } from './messageActions';
import { useSyncActions } from './syncActions';
import { useStatusActions } from './statusActions';

export const useChatActions = (
  state: { chatMessages: Record<string, any>, stations: any[] }, 
  dispatch: React.Dispatch<any>
) => {
  const messageActions = useMessageActions(state, dispatch);
  const syncActions = useSyncActions(state, dispatch);
  const statusActions = useStatusActions(state, dispatch);

  return {
    ...messageActions,
    ...syncActions,
    ...statusActions
  };
};
