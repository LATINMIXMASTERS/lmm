
import React, { memo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChatMessage } from '@/models/RadioStation';

// Import our new components
import ChatMessageItem from './chat/ChatMessageItem';
import NetworkStatus from './chat/NetworkStatus';
import ChatInput from './chat/ChatInput';
import EmptyChat from './chat/EmptyChat';
import AuthRequiredNotice from './chat/AuthRequiredNotice';
import LastSyncTime from './chat/LastSyncTime';
import { useChatRoom } from './chat/useChatRoom';

interface ChatRoomProps {
  stationId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  lastSyncTime?: Date;
}

const ChatRoom: React.FC<ChatRoomProps> = memo(({ 
  stationId, 
  messages, 
  onSendMessage,
  lastSyncTime 
}) => {
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const {
    user,
    isAnonymous,
    isOnline,
    messagesEndRef,
    handleSendMessage
  } = useChatRoom({ messages, onSendMessage });

  // Safe message send handler - prevent form default behavior
  const safeSendMessage = (message: string) => {
    try {
      handleSendMessage(message);
    } catch (error) {
      console.error('Error in chat message sending:', error);
    }
  };

  return (
    <Card className={`mt-6 ${isMobile ? 'h-[400px]' : 'h-[500px]'} flex flex-col`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          <NetworkStatus isOnline={isOnline} />
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col p-3 h-full">
        <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <EmptyChat />
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <ChatMessageItem 
                  key={msg.id} 
                  message={msg} 
                  isCurrentUser={msg.userId === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
        
        {isAnonymous ? (
          <AuthRequiredNotice />
        ) : (
          <ChatInput 
            onSendMessage={safeSendMessage}
            isDisabled={isAnonymous}
            isOnline={isOnline}
          />
        )}
        
        <LastSyncTime lastSyncTime={lastSyncTime} />
      </CardContent>
    </Card>
  );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;
