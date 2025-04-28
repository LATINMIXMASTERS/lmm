
import React, { memo } from 'react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    userId?: string;
    username?: string;
    message: string;
    timestamp: number | string | Date;
    userRole?: string;
    userAvatar?: string;
  };
  isCurrentUser: boolean;
}

const ChatMessageItem: React.FC<ChatMessageProps> = memo(({ message, isCurrentUser }) => {
  const formattedTime = React.useMemo(() => {
    try {
      // Handle different timestamp formats
      const timestamp = typeof message.timestamp === 'number' 
        ? new Date(message.timestamp) 
        : typeof message.timestamp === 'string' 
          ? new Date(message.timestamp) 
          : message.timestamp;
          
      if (isNaN(timestamp.getTime())) {
        return 'Invalid time';
      }
      
      return format(timestamp, 'h:mm a');
    } catch (error) {
      console.error('Error formatting timestamp:', error, message.timestamp);
      return 'Invalid time';
    }
  }, [message.timestamp]);

  const initials = message.username 
    ? message.username.substring(0, 2).toUpperCase() 
    : 'U';

  return (
    <div
      key={message.id}
      className={cn(
        'flex items-start mb-4 gap-2',
        isCurrentUser ? 'justify-end' : 'justify-start'
      )}
      data-testid="chat-message"
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.userAvatar || ''} alt={message.username || 'User'} />
          <AvatarFallback className="bg-primary/80 text-white text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-2 text-sm',
          isCurrentUser 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}
      >
        <div className="flex justify-between items-center mb-1">
          <span className="font-semibold">
            {isCurrentUser ? 'You' : message.username || 'Anonymous'}
          </span>
          <span className="text-xs opacity-70 ml-2">{formattedTime}</span>
        </div>
        <p>{message.message}</p>
      </div>
      
      {isCurrentUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.userAvatar || ''} alt={message.username || 'You'} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

ChatMessageItem.displayName = 'ChatMessageItem';

export default ChatMessageItem;
