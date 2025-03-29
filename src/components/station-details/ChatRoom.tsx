
import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/models/RadioStation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Send, WifiOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatRoomProps {
  stationId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  lastSyncTime?: Date;
}

// Memoized chat message component to prevent unnecessary re-renders
const ChatMessageItem = memo(({ 
  message, 
  isCurrentUser 
}: { 
  message: ChatMessage; 
  isCurrentUser: boolean;
}) => {
  const formattedTime = React.useMemo(() => {
    const timestamp = typeof message.timestamp === 'string' 
      ? new Date(message.timestamp)
      : message.timestamp;
    return format(timestamp, 'h:mm a');
  }, [message.timestamp]);
  
  return (
    <div className={`flex items-start gap-2 ${isCurrentUser ? 'justify-end' : ''}`}>
      {!isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}
      
      <div className={`max-w-[80%] ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium">
            {isCurrentUser ? 'You' : message.username}
          </span>
          <span className="text-xs opacity-70">
            {formattedTime}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
      </div>
      
      {isCurrentUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          {message.username.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

const ChatRoom: React.FC<ChatRoomProps> = memo(({ 
  stationId, 
  messages, 
  onSendMessage,
  lastSyncTime 
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isAnonymous = !user;
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Network status effect
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Auto-scroll to bottom effect, optimized to only run when messages count changes
  useEffect(() => {
    const currentLength = messages?.length || 0;
    if (currentLength !== prevMessagesLengthRef.current) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
      prevMessagesLengthRef.current = currentLength;
    }
  }, [messages]);

  // Memoize the handleSendMessage function
  const handleSendMessage = useCallback(() => {
    if (message.trim() && user && isOnline) {
      onSendMessage(message);
      setMessage('');
    }
  }, [message, user, onSendMessage, isOnline]);

  // Memoize the handleKeyDown function
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Format time for display
  const formattedSyncTime = lastSyncTime ? format(lastSyncTime, 'h:mm:ss a') : 'Never';

  return (
    <Card className={`mt-6 ${isMobile ? 'h-[400px]' : 'h-[500px]'} flex flex-col`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          {!isOnline && (
            <div className="flex items-center text-destructive text-xs">
              <WifiOff className="h-3 w-3 mr-1" />
              Offline
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col p-3 h-full">
        <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Be the first to chat!</p>
            </div>
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
          <div className="border border-muted rounded p-3 text-center text-sm">
            <p>Please sign in to participate in the chat</p>
          </div>
        ) : (
          <div className="flex gap-2 items-end">
            <Textarea
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[60px] resize-none"
              maxLength={500}
              disabled={!isOnline}
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={!message.trim() || !isOnline} 
              className="h-10 w-10 p-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <div className="mt-2 text-xs text-muted-foreground text-right">
          Last sync: {formattedSyncTime}
        </div>
      </CardContent>
    </Card>
  );
});

ChatRoom.displayName = 'ChatRoom';

export default ChatRoom;
