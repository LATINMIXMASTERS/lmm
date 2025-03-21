
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

  const getChatMessagesForStationImpl = (stationId: string): ChatMessage[] => {
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

    // Dispatch action to add message
    dispatch({ 
      type: 'ADD_CHAT_MESSAGE', 
      payload: newMessage
    });

    // Update localStorage
    const currentMessages = state.chatMessages[stationId] || [];
    const updatedMessages = [...currentMessages, newMessage];
    
    // Store in localStorage with a limit to prevent it from getting too large
    const limitedMessages = updatedMessages.slice(-100); // Keep last 100 messages
    
    const allChatMessages = {
      ...state.chatMessages,
      [stationId]: limitedMessages
    };
    
    localStorage.setItem('latinmixmasters_chat_messages', JSON.stringify(allChatMessages));
    
    console.log(`Sent chat message to station ${stationId}:`, newMessage);
  };

  const setStationLiveStatusImpl = (stationId: string, isLive: boolean): void => {
    dispatch({
      type: 'SET_STATION_LIVE_STATUS',
      payload: { stationId, isLive }
    });

    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, isLive };
      }
      return station;
    });
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    // Notify users when a station goes live
    if (isLive) {
      toast({
        title: "Station is Live!",
        description: `${state.stations.find(s => s.id === stationId)?.name || 'A station'} is now broadcasting live.`
      });
    }
  };

  return {
    getChatMessagesForStation: getChatMessagesForStationImpl,
    sendChatMessage: sendChatMessageImpl,
    setStationLiveStatus: setStationLiveStatusImpl
  };
};
