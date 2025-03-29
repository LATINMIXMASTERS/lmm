
export const useSyncActions = (
  state: { chatMessages: Record<string, any> }, 
  dispatch: React.Dispatch<any>
) => {
  // Improved synchronization with debounce mechanism
  let syncTimeout: number | null = null;
  let lastSyncTime = 0;
  const MIN_SYNC_INTERVAL = 500; // Shorter interval for more responsive syncing
  
  const syncChatMessagesFromStorage = () => {
    // Prevent too frequent syncs
    const now = Date.now();
    if (now - lastSyncTime < MIN_SYNC_INTERVAL) {
      // If called too frequently, debounce it
      if (syncTimeout) {
        window.clearTimeout(syncTimeout);
      }
      
      syncTimeout = window.setTimeout(() => {
        performSync();
      }, MIN_SYNC_INTERVAL);
      
      return state.chatMessages;
    }
    
    return performSync();
  };
  
  const performSync = () => {
    lastSyncTime = Date.now();
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
          
          console.log("Chat messages synced from localStorage:", new Date().toISOString());
        }
        
        return parsedMessages;
      }
    } catch (error) {
      console.error("Failed to sync chat messages from localStorage:", error);
      // Create an empty chat messages object if parsing fails
      localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
    }
    
    return state.chatMessages;
  };
  
  const syncStationsFromStorage = () => {
    try {
      const storedStations = localStorage.getItem('latinmixmasters_stations');
      if (storedStations) {
        const parsedStations = JSON.parse(storedStations);
        
        // Deep comparison to prevent unnecessary re-renders
        if (JSON.stringify(state.stations) !== JSON.stringify(parsedStations)) {
          dispatch({ 
            type: 'SET_STATIONS', 
            payload: parsedStations 
          });
          
          console.log("Stations synced from localStorage:", new Date().toISOString());
        }
      }
    } catch (error) {
      console.error("Failed to sync stations from localStorage:", error);
    }
  };

  return {
    syncChatMessagesFromStorage,
    syncStationsFromStorage
  };
};
