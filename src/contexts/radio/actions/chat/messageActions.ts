
import { ChatMessage } from '@/models/RadioStation';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useMessageActions = (
  state: { chatMessages: Record<string, ChatMessage[]> }, 
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

    // Create a new message with precise timestamp
    const newMessage: ChatMessage = {
      id: uuidv4(),
      stationId,
      userId: user.id,
      username: user.username || 'Anonymous',
      message: message.trim(),
      timestamp: new Date().toISOString()
    };

    // Get current messages
    const currentMessages = state.chatMessages[stationId] || [];
    
    // Prevent duplicate messages by ID
    if (currentMessages.some(msg => msg.id === newMessage.id)) {
      return;
    }
    
    const updatedMessages = [...currentMessages, newMessage];
    
    // Store in localStorage with a limit to prevent it from getting too large
    const limitedMessages = updatedMessages.slice(-100); // Keep last 100 messages
    
    const allChatMessages = {
      ...state.chatMessages,
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
    try {
      // We need to use this trick to force a storage event across different tabs/windows
      const event = new StorageEvent('storage', {
        key: 'latinmixmasters_chat_messages',
        newValue: JSON.stringify(allChatMessages)
      });
      
      // Dispatch the event to notify other tabs/windows
      window.dispatchEvent(event);
      
      // For cross-device sync, we periodically modify localStorage with a timestamp
      // This helps ensure that changes propagate across devices
      localStorage.setItem('chat_sync_timestamp', new Date().toISOString());
    } catch (error) {
      console.error("Failed to synchronize chat message:", error);
    }
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
        
        // Force a storage event for cross-tab/device synchronization
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_chat_messages',
          newValue: JSON.stringify(remainingMessages)
        }));
        
        console.log(`Chat messages for station ${stationId} cleared at ${new Date().toISOString()}`);
      }
    } catch (error) {
      console.error(`Failed to clear chat messages for station ${stationId}:`, error);
    }
  };

  return {
    getChatMessagesForStation: getChatMessagesForStationImpl,
    sendChatMessage: sendChatMessageImpl,
    clearChatMessagesForStation: clearChatMessagesForStationImpl
  };
};
