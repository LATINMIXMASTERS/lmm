
import React, { useState } from 'react';
import { BarChart, Settings, Radio, Mic2 } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioStation } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';

const StreamingSetup: React.FC = () => {
  const { stations, updateStreamDetails } = useRadio();
  const { toast } = useToast();
  
  const [selectedStation, setSelectedStation] = useState<string>(stations[0]?.id || '');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamPort, setStreamPort] = useState<string>('');
  const [streamPassword, setStreamPassword] = useState<string>('');
  
  // Handle station selection change
  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId);
    const station = stations.find(s => s.id === stationId);
    if (station && station.streamDetails) {
      setStreamUrl(station.streamDetails.url || '');
      setStreamPort(station.streamDetails.port || '');
      setStreamPassword(station.streamDetails.password || '');
    } else {
      setStreamUrl('');
      setStreamPort('');
      setStreamPassword('');
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateStreamDetails(selectedStation, {
      url: streamUrl,
      port: streamPort,
      password: streamPassword
    });
    
    toast({
      title: "Stream settings updated",
      description: "Your streaming settings have been saved."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mic2 className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Host Streaming Setup</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Stream Configuration</CardTitle>
          <CardDescription>
            Configure the streaming settings for your radio stations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="station">Select Station</Label>
              <Select 
                value={selectedStation} 
                onValueChange={handleStationChange}
              >
                <SelectTrigger id="station">
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent>
                  {stations.map(station => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="streamUrl">Stream URL</Label>
                <Input
                  id="streamUrl"
                  value={streamUrl}
                  onChange={(e) => setStreamUrl(e.target.value)}
                  placeholder="e.g., cast.yourstreamingservice.com"
                />
              </div>
              
              <div>
                <Label htmlFor="streamPort">Port</Label>
                <Input
                  id="streamPort"
                  value={streamPort}
                  onChange={(e) => setStreamPort(e.target.value)}
                  placeholder="e.g., 8000"
                />
              </div>
              
              <div>
                <Label htmlFor="streamPassword">Stream Password</Label>
                <Input
                  id="streamPassword"
                  type="password"
                  value={streamPassword}
                  onChange={(e) => setStreamPassword(e.target.value)}
                  placeholder="Your stream password"
                />
              </div>
            </div>
            
            <Button type="submit" className="w-full md:w-auto">
              Save Streaming Settings
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Streaming Instructions</CardTitle>
          <CardDescription>
            How to connect to Shoutcast using BUTT (Broadcast Using This Tool)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">Instructions for BUTT (Broadcast Using This Tool)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download and install BUTT from <a href="https://danielnoethen.de/butt/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://danielnoethen.de/butt/</a></li>
              <li>Open BUTT and go to Settings</li>
              <li>In the "Server" tab, click "Add" to create a new server</li>
              <li>Enter a name for your server (e.g., "LATINMIXMASTERS")</li>
              <li>Set the server type to "Shoutcast"</li>
              <li>Enter your stream URL in the "Address" field</li>
              <li>Enter your port number in the "Port" field</li>
              <li>Enter your stream password in the "Password" field</li>
              <li>In the "Audio" tab, select your microphone or audio input device</li>
              <li>Click "Save" to save your settings</li>
              <li>In the main BUTT window, select your server from the dropdown menu</li>
              <li>Click "Play" to start broadcasting to your station</li>
            </ol>
            
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Tip:</strong> For the best audio quality, configure BUTT settings to use MP3 encoding with a bitrate of at least 128 kbps. For talk shows, you can use a lower bitrate (64-96 kbps), while music shows should use higher bitrates (128-320 kbps).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingSetup;
