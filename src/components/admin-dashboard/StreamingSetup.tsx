
import React, { useState } from 'react';
import { Radio, Settings } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock } from 'lucide-react';

const StreamingSetup: React.FC = () => {
  const { stations, updateStreamDetails } = useRadio();
  const { toast } = useToast();
  
  const [stationSettings, setStationSettings] = useState<Record<string, {
    url: string;
    port: string;
    password: string;
  }>>({});
  
  React.useEffect(() => {
    const initialSettings: Record<string, {url: string; port: string; password: string}> = {};
    
    stations.forEach(station => {
      initialSettings[station.id] = {
        url: station.streamDetails?.url || '',
        port: station.streamDetails?.port || '',
        password: station.streamDetails?.password || ''
      };
    });
    
    setStationSettings(initialSettings);
  }, [stations]);
  
  const handleSettingChange = (stationId: string, field: 'url' | 'port' | 'password', value: string) => {
    setStationSettings(prev => ({
      ...prev,
      [stationId]: {
        ...prev[stationId],
        [field]: value
      }
    }));
  };
  
  const handleSaveStreamSettings = (stationId: string) => {
    const settings = stationSettings[stationId];
    
    if (!settings.url || !settings.port || !settings.password) {
      toast({
        title: "Validation Error",
        description: "All stream settings fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    let formattedUrl = settings.url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    updateStreamDetails(stationId, {
      ...settings,
      url: formattedUrl
    });
    
    toast({
      title: "Settings Updated",
      description: "Stream settings for hosts have been updated successfully."
    });
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-blue" />
            Host Streaming Setup
          </CardTitle>
          <CardDescription>Configure the streaming settings for radio hosts to connect with their broadcasting software</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-md p-3 mb-4 flex items-start">
            <Lock className="w-5 h-5 text-blue mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              These Shoutcast/Icecast streaming details are only visible to admins and will be provided to verified radio hosts when they go live.
              <br />
              <strong>Note:</strong> These settings are for hosts to <strong>broadcast</strong> to the server, not for listeners to connect.
            </div>
          </div>
        </CardContent>
      </Card>
      
      {stations.map((station) => (
        <Card key={station.id}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Radio className="w-5 h-5 mr-2 text-blue" />
              {station.name}
            </CardTitle>
            <CardDescription>{station.genre} • {station.listeners} listeners</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor={`url-${station.id}`} className="mb-2 block">
                  Stream Server URL
                </Label>
                <Input
                  id={`url-${station.id}`}
                  value={stationSettings[station.id]?.url || ''}
                  onChange={(e) => handleSettingChange(station.id, 'url', e.target.value)}
                  placeholder="e.g., stream.yourserver.com"
                />
                <p className="text-xs text-gray-500 mt-1">The URL hosts will connect to for broadcasting</p>
              </div>
              <div>
                <Label htmlFor={`port-${station.id}`} className="mb-2 block">
                  Port
                </Label>
                <Input
                  id={`port-${station.id}`}
                  value={stationSettings[station.id]?.port || ''}
                  onChange={(e) => handleSettingChange(station.id, 'port', e.target.value)}
                  placeholder="e.g., 8000"
                />
                <p className="text-xs text-gray-500 mt-1">The server port for Shoutcast/Icecast</p>
              </div>
              <div>
                <Label htmlFor={`password-${station.id}`} className="mb-2 block">
                  Stream Password
                </Label>
                <Input
                  id={`password-${station.id}`}
                  type="password"
                  value={stationSettings[station.id]?.password || ''}
                  onChange={(e) => handleSettingChange(station.id, 'password', e.target.value)}
                  placeholder="Password"
                />
                <p className="text-xs text-gray-500 mt-1">The password hosts need to authenticate</p>
              </div>
            </div>
            
            <Button 
              onClick={() => handleSaveStreamSettings(station.id)}
              className="bg-blue hover:bg-blue-dark"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save Host Streaming Settings
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StreamingSetup;
