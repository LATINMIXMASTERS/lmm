
import React, { useState, useEffect } from 'react';
import { Mic2, Radio, Info } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioStation } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';

const StreamingSetup: React.FC = () => {
  const { stations, updateStreamDetails } = useRadio();
  const { toast } = useToast();
  
  const [selectedStation, setSelectedStation] = useState<string>(stations[0]?.id || '');
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamPort, setStreamPort] = useState<string>('');
  const [streamPassword, setStreamPassword] = useState<string>('');
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  
  // Update form when station selection changes
  useEffect(() => {
    const station = stations.find(s => s.id === selectedStation);
    if (station) {
      setCurrentStation(station);
      if (station.streamDetails) {
        setStreamUrl(station.streamDetails.url || '');
        setStreamPort(station.streamDetails.port || '');
        setStreamPassword(station.streamDetails.password || '');
      } else {
        setStreamUrl('');
        setStreamPort('');
        setStreamPassword('');
      }
    }
  }, [selectedStation, stations]);

  // Handle station selection change
  const handleStationChange = (stationId: string) => {
    setSelectedStation(stationId);
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
      description: `Streaming settings for ${currentStation?.name} have been saved.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Mic2 className="h-5 w-5" />
        <h2 className="text-2xl font-bold">Host Streaming Setup</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Radio Stations</CardTitle>
              <CardDescription>
                Select a station to configure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                
                {currentStation && (
                  <div className="space-y-2">
                    <div className="rounded-md overflow-hidden">
                      <img 
                        src={currentStation.image} 
                        alt={currentStation.name} 
                        className="w-full h-32 object-cover" 
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">{currentStation.name}</h4>
                      <p className="text-sm text-gray-500">{currentStation.genre}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="config">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="config" className="flex-1">
                Stream Configuration
              </TabsTrigger>
              <TabsTrigger value="details" className="flex-1">
                Connection Details
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex-1">
                How to Connect
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="config">
              <Card>
                <CardHeader>
                  <CardTitle>Stream Configuration</CardTitle>
                  <CardDescription>
                    Set up the streaming details for {currentStation?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form id="stream-config-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="streamUrl">Stream URL</Label>
                      <Input
                        id="streamUrl"
                        value={streamUrl}
                        onChange={(e) => setStreamUrl(e.target.value)}
                        placeholder="e.g., cast.yourstreamingservice.com"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the URL without http:// or https://
                      </p>
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
                  </form>
                </CardContent>
                <CardFooter>
                  <Button type="submit" form="stream-config-form">
                    Save Streaming Settings
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Details</CardTitle>
                  <CardDescription>
                    Current streaming configuration for {currentStation?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentStation?.streamDetails ? (
                    <StreamDetails
                      url={currentStation.streamDetails.url || 'Not configured'}
                      port={currentStation.streamDetails.port || 'Not configured'}
                      password={currentStation.streamDetails.password || 'Not configured'}
                    />
                  ) : (
                    <div className="flex items-center justify-center p-6 text-muted-foreground">
                      <div className="text-center">
                        <Radio className="h-8 w-8 mb-2 mx-auto" />
                        <p>No streaming details configured for this station yet.</p>
                        <p className="text-sm">Configure in the Stream Configuration tab.</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="instructions">
              <Card>
                <CardHeader>
                  <CardTitle>Broadcasting Instructions</CardTitle>
                  <CardDescription>
                    How to connect and broadcast to {currentStation?.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StreamingInstructions
                    stationName={currentStation?.name || 'your station'}
                    streamUrl={currentStation?.streamDetails?.url}
                    streamPort={currentStation?.streamDetails?.port}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StreamingSetup;
