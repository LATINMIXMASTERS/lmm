
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface LiveControlsProps {
  stationId: string;
  isLive: boolean;
  chatEnabled: boolean;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
}

const LiveControls: React.FC<LiveControlsProps> = ({ 
  stationId, 
  isLive, 
  chatEnabled, 
  onToggleLiveStatus, 
  onToggleChat 
}) => {
  return (
    <div className="mb-6 mt-4 space-y-4">
      <div className="flex flex-col gap-4 p-4 border rounded-md bg-muted">
        <h3 className="text-lg font-medium text-foreground">Broadcast Controls</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch 
              checked={isLive} 
              onCheckedChange={onToggleLiveStatus} 
              id="live-status"
            />
            <label htmlFor="live-status" className="cursor-pointer text-foreground">
              {isLive ? 
                <Badge variant="destructive" className="animate-pulse">LIVE</Badge> : 
                'Go Live'}
            </label>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Station is currently {isLive ? 'broadcasting live' : 'offline'}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Switch 
              checked={chatEnabled || false} 
              onCheckedChange={onToggleChat}
              disabled={!isLive}
              id="chat-status"
            />
            <label htmlFor="chat-status" className={`cursor-pointer text-foreground ${!isLive ? 'opacity-50' : ''}`}>
              {chatEnabled ? 
                <Badge className="bg-green-500">Chat Enabled</Badge> : 
                'Enable Chat'}
            </label>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {!isLive ? 
              'Set station to live first' : 
              (chatEnabled ? 'Chat is active' : 'Chat is disabled')}
          </div>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground">
        These controls are for demonstration purposes - in production, live status would be determined by actual streaming activity.
      </p>
    </div>
  );
};

export default LiveControls;
