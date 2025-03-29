
import React, { memo } from 'react';
import { format } from 'date-fns';
import { ChatMessage } from '@/models/RadioStation';

interface ChatMessageItemProps {
  message: ChatMessage;
  isCurrentUser: boolean;
}

// Memoized chat message component to prevent unnecessary re-renders
const ChatMessageItem = memo(({ 
  message, 
  isCurrentUser 
}: ChatMessageItemProps) => {
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

export default ChatMessageItem;
