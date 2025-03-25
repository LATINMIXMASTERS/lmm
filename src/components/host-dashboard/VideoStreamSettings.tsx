
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Video } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';

interface VideoStreamSettingsProps {
  station: any;
}

const VideoStreamSettings: React.FC<VideoStreamSettingsProps> = ({ station }) => {
  const { updateVideoStreamUrl } = useRadio();
  const { toast } = useToast();
  const [videoStreamUrl, setVideoStreamUrl] = useState(station?.videoStreamUrl || '');

  const handleSave = () => {
    if (!videoStreamUrl.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid stream URL",
        variant: "destructive"
      });
      return;
    }

    updateVideoStreamUrl(station.id, videoStreamUrl);
    toast({
      title: "Video Stream Updated",
      description: "Your video stream URL has been updated"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5 text-primary" />
          Video Stream Settings
        </CardTitle>
        <CardDescription>
          Set up a video stream URL for your radio show. Viewers can watch your broadcast while listening.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="videoStreamUrl" className="text-sm font-medium block mb-1">
              M3U8 Video Stream URL
            </label>
            <Input
              id="videoStreamUrl"
              placeholder="https://example.com/stream.m3u8"
              value={videoStreamUrl}
              onChange={(e) => setVideoStreamUrl(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the full URL to your HLS (M3U8) video stream
            </p>
          </div>
          
          <div className="pt-2">
            <Button onClick={handleSave}>
              Save Video Stream URL
            </Button>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Tips for video streaming:</h4>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Use a service like OBS Studio to create your stream</li>
              <li>Configure your stream output as HLS format</li>
              <li>Your stream URL should end with .m3u8</li>
              <li>Make sure your stream server has CORS enabled</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoStreamSettings;
