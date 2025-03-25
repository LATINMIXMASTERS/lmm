
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video, Save } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

interface LiveControlsProps {
  stationId: string;
  isLive: boolean;
  chatEnabled: boolean;
  videoStreamUrl: string;
  showVideoPlayer: boolean;
  onToggleLiveStatus: () => void;
  onToggleChat: () => void;
  onToggleVideo: () => void;
  onUpdateVideoStreamUrl: (url: string) => void;
}

const LiveControls: React.FC<LiveControlsProps> = ({ 
  stationId, 
  isLive, 
  chatEnabled, 
  videoStreamUrl,
  showVideoPlayer,
  onToggleLiveStatus, 
  onToggleChat,
  onToggleVideo,
  onUpdateVideoStreamUrl
}) => {
  const [customVideoUrl, setCustomVideoUrl] = useState(videoStreamUrl || '');
  const { toast } = useToast();
  
  const handleSaveVideoUrl = () => {
    if (!customVideoUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid M3U8 stream URL",
        variant: "destructive"
      });
      return;
    }
    
    onUpdateVideoStreamUrl(customVideoUrl);
    toast({
      title: "Video Stream URL Updated",
      description: "Your changes have been saved"
    });
  };
  
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
        
        {/* Video Toggle and URL Input */}
        <div className="pt-3 border-t border-border">
          <h4 className="text-md font-medium mb-3">Video Stream Settings</h4>
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Switch 
                checked={showVideoPlayer} 
                onCheckedChange={onToggleVideo}
                id="video-status"
              />
              <label htmlFor="video-status" className="cursor-pointer text-foreground flex items-center gap-1">
                <Video className="h-4 w-4" />
                {showVideoPlayer ? 'Hide Video Stream' : 'Show Video Stream'}
              </label>
            </div>
            
            <div className="text-sm text-muted-foreground">
              {!isLive 
                ? 'Set station to live first' 
                : (showVideoPlayer 
                  ? 'Video stream is visible' 
                  : 'Video stream is hidden')}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="video-url" className="text-sm font-medium">
              M3U8 Video Stream URL
            </label>
            <div className="flex gap-2">
              <Input
                id="video-url"
                placeholder="https://example.com/stream.m3u8"
                value={customVideoUrl}
                onChange={(e) => setCustomVideoUrl(e.target.value)}
              />
              <Button 
                onClick={handleSaveVideoUrl}
                size="sm"
                className="whitespace-nowrap"
              >
                <Save className="h-4 w-4 mr-1" />
                Save URL
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the HLS (M3U8) video stream URL for your broadcast
            </p>
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
