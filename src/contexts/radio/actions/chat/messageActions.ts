
export const useChatActions = (
  state: { chatMessages: Record<string, any>; stations?: any[] }, 
  dispatch: React.Dispatch<any>
) => {
  const sendChatMessage = (stationId: string, message: string) => {
    if (!stationId || !message.trim()) return;
    
    const newMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stationId,
      content: message.trim(),
      timestamp: new Date().toISOString(),
      sender: 'user' // In a real app, this would be the actual user's info
    };
    
    dispatch({
      type: 'ADD_CHAT_MESSAGE',
      payload: {
        stationId,
        message: newMessage
      }
    });
    
    // Sync to localStorage
    const currentMessages = state.chatMessages[stationId] || [];
    const updatedMessages = [...currentMessages, newMessage];
    
    try {
      localStorage.setItem(
        `latinmixmasters_chat_${stationId}`, 
        JSON.stringify(updatedMessages)
      );
    } catch (error) {
      console.error('Error saving chat message to localStorage:', error);
    }
    
    return newMessage;
  };
  
  const clearChatMessagesForStation = (stationId: string) => {
    if (!stationId) return;
    
    dispatch({
      type: 'CLEAR_CHAT_MESSAGES',
      payload: { stationId }
    });
    
    try {
      localStorage.removeItem(`latinmixmasters_chat_${stationId}`);
    } catch (error) {
      console.error('Error clearing chat messages from localStorage:', error);
    }
  };
  
  const getChatMessagesForStation = (stationId: string) => {
    return state.chatMessages[stationId] || [];
  };
  
  return {
    sendChatMessage,
    clearChatMessagesForStation,
    getChatMessagesForStation
  };
};
