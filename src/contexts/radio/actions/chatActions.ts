
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

  // Optimized synchronization with debounce mechanism
  let syncTimeout: number | null = null;
  
  const syncChatMessagesFromStorage = () => {
    // Clear any pending sync to prevent multiple rapid syncs
    if (syncTimeout) {
      window.clearTimeout(syncTimeout);
    }
    
    // Set a new timeout for the sync
    syncTimeout = window.setTimeout(() => {
      try {
        const storedMessages = localStorage.getItem('latinmixmasters_chat_messages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          // Only dispatch if there's an actual change to prevent unnecessary re-renders
          if (JSON.stringify(state.chatMessages) !== JSON.stringify(parsedMessages)) {
            dispatch({ 
              type: 'SET_CHAT_MESSAGES', 
              payload: parsedMessages 
            });
          }
        }
      } catch (error) {
        console.error("Failed to sync chat messages from localStorage:", error);
        // Create an empty chat messages object if parsing fails
        localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify({}));
      }
    }, 100); // Small delay to debounce multiple calls
  };

  const getChatMessagesForStationImpl = (stationId: string): ChatMessage[] => {
    // We don't want to sync within this function to avoid infinite loops
    // Just return what's in the current state
    return state.chatMessages[stationId] || [];
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

    // Get current messages without syncing
    const currentMessages = state.chatMessages[stationId] || [];
    const updatedMessages = [...currentMessages, newMessage];
    
    // Store in localStorage with a limit to prevent it from getting too large
    const limitedMessages = updatedMessages.slice(-100); // Keep last 100 messages
    
    const allChatMessages = {
      ...state.chatMessages,
      [stationId]: limitedMessages
    };
    
    // Update localStorage with the latest messages
    localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(allChatMessages));
    
    // Dispatch action to add message
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      payload: newMessage
    });
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
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
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
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
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
