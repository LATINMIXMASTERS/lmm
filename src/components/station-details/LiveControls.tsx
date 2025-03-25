import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video, Save, AlertCircle, HelpCircle } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
        description: "Please enter a valid stream URL",
        variant: "destructive"
      });
      return;
    }
    
    // Check if URL ends with .m3u8 extension or is known to work
    const isKnownWorkingUrl = customVideoUrl.includes('lmmappstore.com');
    const isM3u8Url = customVideoUrl.toLowerCase().endsWith('.m3u8');
    
    if (!isM3u8Url && !isKnownWorkingUrl) {
      toast({
        title: "Warning: URL Format",
        description: "The URL doesn't end with .m3u8, which is the expected format for HLS streams",
        variant: "destructive"
      });
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
          <h4 className="text-md font-medium mb-3 flex items-center">
            Video Stream Settings
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 ml-2 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-sm">
                  <p>For best compatibility, use a .m3u8 HLS stream from a server with CORS enabled.</p>
                  <p className="mt-1">If direct playback fails, a fallback player will be used.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          
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
            <label htmlFor="video-url" className="text-sm font-medium flex items-center">
              Video Stream URL
              {videoStreamUrl && !videoStreamUrl.toLowerCase().endsWith('.m3u8') && !videoStreamUrl.includes('lmmappstore.com') && (
                <span className="ml-2 text-yellow-600 text-xs flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  URL doesn't end with .m3u8
                </span>
              )}
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
              Enter the video stream URL for your broadcast (HLS or direct embed URLs supported)
            </p>
            
            <div className="bg-yellow-50 dark:bg-yellow-950/30 p-2 rounded text-xs border border-yellow-200 dark:border-yellow-800 mt-2">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">Compatible Stream Formats:</p>
              <ul className="mt-1 list-disc list-inside text-yellow-700 dark:text-yellow-400">
                <li>HTTP Live Streaming (HLS) with .m3u8 extension</li>
                <li>LMM AppStore streams (lmmappstore.com) will use direct embedding</li>
                <li>Ensure the server has proper CORS headers enabled</li>
                <li>Some stream providers require special players or embedding</li>
              </ul>
            </div>
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
