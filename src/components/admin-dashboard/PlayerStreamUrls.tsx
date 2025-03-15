
import React, { useState, useEffect } from 'react';
import { Volume2, Music } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PlayerStreamUrls: React.FC = () => {
  const { stations, updateStreamUrl } = useRadio();
  const { toast } = useToast();
  
  const [streamUrls, setStreamUrls] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const initialStreamUrls: Record<string, string> = {};
    
    stations.forEach(station => {
      initialStreamUrls[station.id] = station.streamUrl || '';
    });
    
    setStreamUrls(initialStreamUrls);
  }, [stations]);
  
  const handleStreamUrlChange = (stationId: string, url: string) => {
    setStreamUrls(prev => ({
      ...prev,
      [stationId]: url
    }));
  };
  
  const handleSaveStreamUrl = (stationId: string) => {
    const url = streamUrls[stationId];
    
    if (!url) {
      toast({
        title: "Validation Error",
        description: "Stream URL is required.",
        variant: "destructive"
      });
      return;
    }
    
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    updateStreamUrl(stationId, formattedUrl);
    
    toast({
      title: "Player Stream URL Updated",
      description: "The listener streaming URL has been updated successfully."
    });
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2 text-blue" />
            Player Streaming URLs
          </CardTitle>
          <CardDescription>
            Configure the URLs that listeners and the player will use to connect to each station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-md p-3 mb-6 flex items-start">
            <Music className="w-5 h-5 text-blue mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              These are the public stream URLs that will be used by the player and listeners to tune in to each station. 
              <br/>
              <strong>Note:</strong> These should be the publicly accessible URLs for <strong>listening</strong>, not for broadcasting.
            </div>
          </div>
        
          <div className="space-y-6">
            {stations.map((station) => (
              <div key={station.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-lg">{station.name}</h3>
                  <span className="text-sm text-gray-500">{station.genre}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-3">
                    <Label htmlFor={`stream-url-${station.id}`} className="mb-2 block">
                      Public Stream URL
                    </Label>
                    <Input
                      id={`stream-url-${station.id}`}
                      value={streamUrls[station.id] || ''}
                      onChange={(e) => handleStreamUrlChange(station.id, e.target.value)}
                      placeholder="e.g., https://stream.server.com/station"
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 mt-1">The URL listeners will use to hear this station</p>
                  </div>
                  <Button 
                    onClick={() => handleSaveStreamUrl(station.id)}
                    className="bg-blue hover:bg-blue-dark"
                  >
                    <Volume2 className="w-4 h-4 mr-2" />
                    Save Player URL
                  </Button>
                </div>
                
                {station.streamUrl && (
                  <div className="mt-3 text-sm text-gray-600">
                    Current URL: <span className="font-mono bg-gray-100 p-1 rounded">{station.streamUrl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerStreamUrls;
