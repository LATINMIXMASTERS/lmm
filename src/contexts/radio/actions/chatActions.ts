
import { ChatMessage } from '@/models/RadioStation';

export const useChatActions = (
  state: { 
    chatMessages: Record<string, ChatMessage[]>;
  }, 
  dispatch: React.Dispatch<any>
) => {
  // Helper to generate a unique message ID
  const generateMessageId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // Add a message to a specific station's chat
  const addChatMessageImpl = (stationId: string, message: string, userId: string, username: string, userRole?: string, userAvatar?: string) => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      userId,
      username,
      message,
      timestamp: Date.now(),
      userRole,
      userAvatar,
      stationId
    };
    
    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: newMessage });
    
    // Also save to localStorage for persistence
    const currentMessages = { ...state.chatMessages };
    const stationMessages = currentMessages[stationId] || [];
    const updatedStationMessages = [...stationMessages, newMessage];
    
    // Limit to last 100 messages per station to prevent localStorage overflow
    if (updatedStationMessages.length > 100) {
      updatedStationMessages.splice(0, updatedStationMessages.length - 100);
    }
    
    currentMessages[stationId] = updatedStationMessages;
    
    try {
      localStorage.setItem('lmm_chat_messages', JSON.stringify(currentMessages));
      
      // Broadcast chat update to other tabs/windows
      localStorage.setItem('lmm_chat_update', Date.now().toString());
    } catch (error) {
      console.error('Error saving chat messages to localStorage:', error);
    }
  };
  
  // Get chat messages for a specific station
  const getChatMessagesForStationImpl = (stationId: string): ChatMessage[] => {
    return state.chatMessages[stationId] || [];
  };
  
  // Sync chat messages from localStorage - called when receiving storage events from other tabs
  const syncChatMessagesFromStorageImpl = (): Record<string, ChatMessage[]> => {
    try {
      const savedChatMessages = localStorage.getItem('lmm_chat_messages');
      
      if (savedChatMessages) {
        const parsedMessages = JSON.parse(savedChatMessages) as Record<string, ChatMessage[]>;
        dispatch({ type: 'SET_CHAT_MESSAGES', payload: parsedMessages });
        return parsedMessages;
      }
    } catch (error) {
      console.error('Error syncing chat messages from localStorage:', error);
    }
    
    return state.chatMessages;
  };
  
  // Clear chat messages for a station
  const clearChatMessagesForStationImpl = (stationId: string) => {
    const currentMessages = { ...state.chatMessages };
    
    if (currentMessages[stationId]) {
      delete currentMessages[stationId];
      
      dispatch({ 
        type: 'SET_CHAT_MESSAGES', 
        payload: currentMessages 
      });
      
      try {
        localStorage.setItem('lmm_chat_messages', JSON.stringify(currentMessages));
      } catch (error) {
        console.error('Error clearing chat messages in localStorage:', error);
      }
    }
  };
  
  return {
    addChatMessage: addChatMessageImpl,
    getChatMessagesForStation: getChatMessagesForStationImpl,
    syncChatMessagesFromStorage: syncChatMessagesFromStorageImpl,
    clearChatMessagesForStation: clearChatMessagesForStationImpl
  };
};
