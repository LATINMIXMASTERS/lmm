
import React, { useState, useCallback, FormEvent } from 'react';
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
  
  // Enhanced send message with debounce protection to prevent double-sends on mobile
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
        setTimeout(() => {
          setIsSending(false);
        }, 300);
      }
    }
  }, [message, isDisabled, isOnline, onSendMessage, isSending]);

  // Special handling for Enter key
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // Critical to prevent form submission
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Enhanced form submission handler with extra safeguards
  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault(); // This is crucial to prevent page refresh
    e.stopPropagation(); // Extra protection
    handleSendMessage();
    return false; // Yet another safeguard
  }, [handleSendMessage]);
  
  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex gap-2 items-end"
      // Extra attributes to ensure no submission
      action="javascript:void(0);"
    >
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`min-h-[${isMobile ? '50' : '60'}px] resize-none`}
        maxLength={500}
        disabled={isDisabled || !isOnline || isSending}
        // Make sure autocomplete and correction don't interfere with form submission
        autoComplete="off"
        autoCorrect="off"
        spellCheck="true"
      />
      <Button 
        type="button" // Changed from "submit" to "button" for safer mobile handling
        onClick={handleSubmit}
        disabled={!message.trim() || isDisabled || !isOnline || isSending} 
        className="h-10 w-10 p-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
