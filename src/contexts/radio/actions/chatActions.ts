
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

  // Add a sync mechanism to ensure consistent data
  const syncChatMessagesFromStorage = () => {
    try {
      const storedMessages = localStorage.getItem('latinmixmasters_chat_messages');
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages);
        dispatch({ 
          type: 'SET_CHAT_MESSAGES', 
          payload: parsedMessages 
        });
        console.log("Chat messages synchronized from localStorage");
      }
    } catch (error) {
      console.error("Failed to sync chat messages from localStorage:", error);
    }
  };

  const getChatMessagesForStationImpl = (stationId: string): ChatMessage[] => {
    // First, sync from localStorage to ensure we have the latest data
    syncChatMessagesFromStorage();
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

    // Create a new message
    const newMessage: ChatMessage = {
      id: uuidv4(),
      stationId,
      userId: user.id,
      username: user.username || 'Anonymous',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // First sync to get the latest data
    syncChatMessagesFromStorage();

    // Get current messages after sync
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
    
    console.log(`Sent chat message to station ${stationId}:`, newMessage);
  };

  const setStationLiveStatusImpl = (stationId: string, isLive: boolean, enableChat: boolean = false): void => {
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
    if (isLive) {
      const stationName = state.stations.find(s => s.id === stationId)?.name || 'A station';
      toast({
        title: "Station is Live!",
        description: `${stationName} is now broadcasting live${enableChat ? ' with chat enabled' : ''}.`
      });
    }
  };

  const toggleChatEnabledImpl = (stationId: string, enabled: boolean): void => {
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

  return {
    getChatMessagesForStation: getChatMessagesForStationImpl,
    sendChatMessage: sendChatMessageImpl,
    setStationLiveStatus: setStationLiveStatusImpl,
    toggleChatEnabled: toggleChatEnabledImpl,
    syncChatMessagesFromStorage
  };
};
