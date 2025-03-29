
export const useSyncActions = (
  state: { chatMessages: Record<string, any> }, 
  dispatch: React.Dispatch<any>
) => {
  // Improved synchronization with debounce mechanism
  let syncTimeout: number | null = null;
  let lastSyncTime = 0;
  const MIN_SYNC_INTERVAL = 1000; // Minimum 1 second between syncs
  
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

  return {
    syncChatMessagesFromStorage
  };
};
