
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
            How to connect your broadcasting software to your radio station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">Instructions for OBS/Streamlabs</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Open OBS or Streamlabs OBS</li>
              <li>Go to Settings → Stream</li>
              <li>Select "Custom..." from the service dropdown</li>
              <li>Set the server to: <code className="bg-muted px-1 py-0.5 rounded">rtmp://[YOUR_STREAM_URL]:[PORT]/live</code></li>
              <li>Set the stream key to your stream password</li>
              <li>Click "Apply" and then start streaming</li>
            </ol>
            
            <h3 className="font-semibold mt-6">Instructions for BUTT (Broadcast Using This Tool)</h3>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Download and install BUTT from <a href="https://danielnoethen.de/butt/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://danielnoethen.de/butt/</a></li>
              <li>Open BUTT and go to Settings</li>
              <li>Add a new server with your stream URL, port, and password</li>
              <li>Connect your audio input device</li>
              <li>Click "Play" to start broadcasting</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StreamingSetup;
