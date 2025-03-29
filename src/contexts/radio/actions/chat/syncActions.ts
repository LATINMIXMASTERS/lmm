
export const useSyncActions = (
  state: { chatMessages: Record<string, any>; stations?: any[] }, 
  dispatch: React.Dispatch<any>
) => {
  // Improved synchronization with debounce mechanism
  const syncToLocalStorage = (stationId: string) => {
    if (!stationId || !state.chatMessages[stationId]) return;
    
    try {
      localStorage.setItem(
        `latinmixmasters_chat_${stationId}`, 
        JSON.stringify(state.chatMessages[stationId])
      );
    } catch (error) {
      console.error("Error syncing chat to localStorage:", error);
    }
  };
  
  // Basic sync from localStorage to state
  const syncFromLocalStorage = (stationId: string) => {
    if (!stationId) return null;
    
    try {
      const storedChat = localStorage.getItem(`latinmixmasters_chat_${stationId}`);
      if (storedChat) {
        const parsedChat = JSON.parse(storedChat);
        
        // Prevent unnecessary updates if data is the same
        if (JSON.stringify(parsedChat) !== JSON.stringify(state.chatMessages[stationId])) {
          dispatch({
            type: 'SET_CHAT_MESSAGES',
            payload: {
              stationId,
              messages: parsedChat
            }
          });
          return parsedChat;
        }
      }
    } catch (error) {
      console.error("Error syncing chat from localStorage:", error);
    }
    
    return null;
  };
  
  // Sync chat data across browser tabs
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('latinmixmasters_chat_')) {
      const stationId = e.key.replace('latinmixmasters_chat_', '');
      
      if (e.newValue) {
        try {
          const parsedMessages = JSON.parse(e.newValue);
          dispatch({
            type: 'SET_CHAT_MESSAGES',
            payload: {
              stationId,
              messages: parsedMessages
            }
          });
        } catch (error) {
          console.error("Error handling storage event:", error);
        }
      }
    }
  };
  
  const syncStationsFromStorage = () => {
    try {
      const storedStations = localStorage.getItem('latinmixmasters_stations');
      if (storedStations && state.stations) {
        const parsedStations = JSON.parse(storedStations);
        
        // Deep comparison to prevent unnecessary re-renders
        if (JSON.stringify(parsedStations) !== JSON.stringify(state.stations)) {
          dispatch({
            type: 'SET_STATIONS',
            payload: parsedStations
          });
        }
      }
    } catch (error) {
      console.error("Error syncing stations from localStorage:", error);
    }
  };

  // This function is needed for the RadioContextType interface
  const syncChatMessagesFromStorage = () => {
    try {
      const storedMessages = localStorage.getItem('latinmixmasters_chat_messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        
        // Deep comparison to prevent unnecessary re-renders
        if (JSON.stringify(state.chatMessages) !== JSON.stringify(parsedMessages)) {
          dispatch({ 
            type: 'SET_CHAT_MESSAGES', 
            payload: parsedMessages 
          });
          
          return parsedMessages;
        }
      }
      return state.chatMessages;
    } catch (error) {
      console.error("Failed to sync chat messages from localStorage:", error);
      return state.chatMessages;
    }
  };
  
  return {
    syncToLocalStorage,
    syncFromLocalStorage,
    handleStorageEvent,
    syncStationsFromStorage,
    syncChatMessagesFromStorage
  };
};
