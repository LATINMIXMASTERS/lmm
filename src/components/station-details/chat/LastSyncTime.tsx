
import React from 'react';
import { format } from 'date-fns';

interface LastSyncTimeProps {
  lastSyncTime?: Date;
}

const LastSyncTime: React.FC<LastSyncTimeProps> = ({ lastSyncTime }) => {
  const formattedSyncTime = lastSyncTime ? format(lastSyncTime, 'h:mm:ss a') : 'Never';
  
  return (
    <div className="mt-2 text-xs text-muted-foreground text-right">
      Last sync: {formattedSyncTime}
    </div>
  );
};

export default LastSyncTime;
