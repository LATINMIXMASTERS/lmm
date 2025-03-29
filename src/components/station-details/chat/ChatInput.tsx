
import React, { useState, useCallback } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

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
  
  const handleSendMessage = useCallback(() => {
    if (message.trim() && !isDisabled && isOnline) {
      onSendMessage(message);
      setMessage('');
    }
  }, [message, isDisabled, isOnline, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Handle form submission properly to prevent page refresh
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault(); // This is crucial to prevent page refresh
    handleSendMessage();
  }, [handleSendMessage]);
  
  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <Textarea
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        className="min-h-[60px] resize-none"
        maxLength={500}
        disabled={isDisabled || !isOnline}
      />
      <Button 
        type="submit"
        disabled={!message.trim() || isDisabled || !isOnline} 
        className="h-10 w-10 p-0"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default ChatInput;
