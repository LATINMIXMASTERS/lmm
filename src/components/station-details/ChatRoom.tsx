
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/models/RadioStation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Send, WiFiOff } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useRadio } from '@/hooks/useRadioContext';

interface ChatRoomProps {
  stationId: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ stationId, messages, onSendMessage }) => {
  const { user } = useAuth();
  const { syncChatMessagesFromStorage } = useRadio();
  const [message, setMessage] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const isAnonymous = !user;
  const isMobile = useIsMobile();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  
  // Handle online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncChatMessagesFromStorage();
      setLastSync(new Date());
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncChatMessagesFromStorage]);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    if (chatContentRef.current) {
      const scrollElement = chatContentRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  // Regular polling for sync - more aggressive than the parent component
  useEffect(() => {
    if (!isOnline) return;
    
    // This will force a re-fetch of messages from the shared localStorage
    const intervalId = setInterval(() => {
      syncChatMessagesFromStorage();
      setLastSync(new Date());
    }, 2000); // Sync every 2 seconds
    
    // Force scroll to bottom after refresh
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
    
    return () => clearInterval(intervalId);
  }, [stationId, isOnline, syncChatMessagesFromStorage]);

  const handleSendMessage = () => {
    if (message.trim() && user) {
      onSendMessage(message);
      setMessage('');
      
      // Force sync after a short delay to make sure the message is stored in localStorage
      setTimeout(() => {
        syncChatMessagesFromStorage();
        setLastSync(new Date());
      }, 500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className={`mt-6 ${isMobile ? 'h-[400px]' : 'h-[500px]'} flex flex-col`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Live Chat</CardTitle>
          {!isOnline && (
            <div className="flex items-center text-destructive text-xs">
              <WiFiOff className="h-3 w-3 mr-1" />
              Offline
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col p-3 h-full" ref={chatContentRef}>
        <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollRef}>
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Be the first to chat!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex items-start gap-2 ${msg.userId === user?.id ? 'justify-end' : ''}`}
                >
                  {msg.userId !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {msg.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] ${msg.userId === user?.id ? 'bg-primary text-primary-foreground' : 'bg-muted'} rounded-lg px-3 py-2`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">
                        {msg.userId === user?.id ? 'You' : msg.username}
                      </span>
                      <span className="text-xs opacity-70">
                        {typeof msg.timestamp === 'string' 
                          ? format(new Date(msg.timestamp), 'h:mm a')
                          : format(msg.timestamp, 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                  </div>
                  
                  {msg.userId === user?.id && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                      {user.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              ))}
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
          Last sync: {format(lastSync, 'h:mm:ss a')}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatRoom;
