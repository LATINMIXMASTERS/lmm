
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ChatMessage } from '@/models/RadioStation';

export interface UseChatRoomProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export const useChatRoom = ({ messages, onSendMessage }: UseChatRoomProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef<number>(0);
  const isAnonymous = !user;
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

  const handleSendMessage = (message: string) => {
    if (message.trim() && user && isOnline) {
      onSendMessage(message);
    }
  };

  return {
    user,
    isAnonymous,
    isOnline,
    messagesEndRef,
    handleSendMessage
  };
};
