
import React from 'react';
import { WifiOff } from 'lucide-react';

interface NetworkStatusProps {
  isOnline: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline }) => {
  if (isOnline) return null;
  
  return (
    <div className="flex items-center text-destructive text-xs">
      <WifiOff className="h-3 w-3 mr-1" />
      Offline
    </div>
  );
};

export default NetworkStatus;
