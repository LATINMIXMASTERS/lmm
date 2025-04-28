
import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isDisabled: boolean;
  isOnline: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ 
  onSendMessage, 
  isDisabled, 
  isOnline 
}) => {
  const [message, setMessage] = useState('');
  const isMobile = useIsMobile();
  const [isSending, setIsSending] = useState(false);
  
  // Simplified send message function with debounce protection
  const handleSendMessage = useCallback(() => {
    if (message.trim() && !isDisabled && isOnline && !isSending) {
      setIsSending(true);
      
      try {
        onSendMessage(message);
        setMessage('');
      } catch (error) {
        console.error("Error sending message:", error);
      } finally {
        // Reset sending state after a short delay
        setTimeout(() => setIsSending(false), 300);
      }
    }
  }, [message, isDisabled, isOnline, onSendMessage, isSending]);

  // Handle Enter key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Critical to prevent form submission
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Form submission handler - prevent default to avoid page refreshes
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault(); // Critical to prevent navigation
    handleSendMessage();
  }, [handleSendMessage]);
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex gap-2 items-end"
    >
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`min-h-[${isMobile ? '50' : '60'}px] resize-none`}
        maxLength={500}
        disabled={isDisabled || !isOnline || isSending}
        autoComplete="off"
      />
      <Button 
        type="button" // Changed from submit to button
        onClick={handleSendMessage}
        disabled={!message.trim() || isDisabled || !isOnline || isSending} 
        className="h-10 w-10 p-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
