
import { ChatMessage } from '@/models/RadioStation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useChatActions = (
  state: { chatMessages: Record<string, ChatMessage[]>, stations: any[] }, 
  dispatch: React.Dispatch<any>
) => {
  const { user } = useAuth();
  const { toast } = useToast();

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

  const getChatMessagesForStationImpl = (stationId: string): ChatMessage[] => {
    // Make sure we have the latest messages
    const messages = syncChatMessagesFromStorage();
    return messages[stationId] || [];
  };

  const sendChatMessageImpl = (stationId: string, message: string): void => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to send messages",
        variant: "destructive"
      });
      return;
    }

    if (!message.trim()) return;

    // Create a new message with precise timestamp
    const newMessage: ChatMessage = {
      id: uuidv4(),
      stationId,
      userId: user.id,
      username: user.username || 'Anonymous',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Get current messages by syncing first
    const allMessages = syncChatMessagesFromStorage();
    const currentMessages = allMessages[stationId] || [];
    
    // Prevent duplicate messages by ID
    if (currentMessages.some(msg => msg.id === newMessage.id)) {
      return;
    }
    
    const updatedMessages = [...currentMessages, newMessage];
    
    // Store in localStorage with a limit to prevent it from getting too large
    const limitedMessages = updatedMessages.slice(-100); // Keep last 100 messages
    
    const allChatMessages = {
      ...allMessages,
      [stationId]: limitedMessages
    };
    
    // Force update localStorage immediately with the latest messages
    localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(allChatMessages));
    
    // Dispatch action to add message
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      payload: newMessage
    });
    
    // Trigger a storage event to notify other tabs/windows
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'latinmixmasters_chat_messages',
      newValue: JSON.stringify(allChatMessages)
    }));
  };

  const setStationLiveStatusImpl = (stationId: string, isLive: boolean, enableChat: boolean = false): void => {
    // Get current station status before making changes
    const currentStation = state.stations.find(s => s.id === stationId);
    const statusChanged = currentStation?.isLive !== isLive;
    
    // Only proceed if there's an actual change in status
    if (!statusChanged && currentStation?.chatEnabled === enableChat) {
      return;
    }
    
    // Clean up chat data when station goes offline
    if (!isLive && currentStation?.isLive) {
      clearChatMessagesForStationImpl(stationId);
    }
    
    dispatch({
      type: 'SET_STATION_LIVE_STATUS',
      payload: { stationId, isLive, chatEnabled: enableChat }
    });

    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, isLive, chatEnabled: enableChat };
      }
      return station;
    });
    
    // Update localStorage to ensure cross-device sync
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    // Force a storage event for cross-tab/device synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'latinmixmasters_stations',
      newValue: JSON.stringify(updatedStations)
    }));
    
    // Notify users when a station goes live
    if (isLive && statusChanged) {
      const stationName = state.stations.find(s => s.id === stationId)?.name || 'A station';
      toast({
        title: "Station is Live!",
        description: `${stationName} is now broadcasting live${enableChat ? ' with chat enabled' : ''}.`
      });
    }
  };

  const toggleChatEnabledImpl = (stationId: string, enabled: boolean): void => {
    // Get current station to check if there's a change
    const currentStation = state.stations.find(s => s.id === stationId);
    if (currentStation?.chatEnabled === enabled) {
      return; // No change, avoid unnecessary updates
    }
    
    // If disabling chat, clean up the messages
    if (!enabled && currentStation?.chatEnabled) {
      clearChatMessagesForStationImpl(stationId);
    }
    
    dispatch({
      type: 'TOGGLE_CHAT_ENABLED',
      payload: { stationId, enabled }
    });

    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, chatEnabled: enabled };
      }
      return station;
    });
    
    // Update localStorage and trigger storage event for cross-device sync
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    // Force a storage event for cross-tab/device synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'latinmixmasters_stations',
      newValue: JSON.stringify(updatedStations)
    }));
    
    toast({
      title: enabled ? "Chat Enabled" : "Chat Disabled",
      description: `Chat has been ${enabled ? 'enabled' : 'disabled'} for this station.`
    });
  };

  // Function to clear chat messages for a specific station
  const clearChatMessagesForStationImpl = (stationId: string): void => {
    try {
      // Get current messages directly from localStorage
      const storedMessages = localStorage.getItem('latinmixmasters_chat_messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        // Remove chat messages for this station
        const { [stationId]: _, ...remainingMessages } = parsedMessages;
        
        // Update localStorage
        localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(remainingMessages));
        
        // Update state
        dispatch({ 
          type: 'SET_CHAT_MESSAGES', 
          payload: remainingMessages 
        });
        
        console.log(`Chat messages for station ${stationId} cleared at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`Failed to clear chat messages for station ${stationId}:`, error);
    }
  };

  return {
    getChatMessagesForStation: getChatMessagesForStationImpl,
    sendChatMessage: sendChatMessageImpl,
    setStationLiveStatus: setStationLiveStatusImpl,
    toggleChatEnabled: toggleChatEnabledImpl,
    syncChatMessagesFromStorage,
    clearChatMessagesForStation: clearChatMessagesForStationImpl
  };
};
