
import React, { useState, useEffect } from 'react';
import { Mic2, Radio } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioStation } from '@/models/RadioStation';
import StreamDetails from '@/components/station-details/StreamDetails';
import StreamingInstructions from '@/components/station-details/StreamingInstructions';
import StationSelector from './streaming/StationSelector';
import StreamConfigForm from './streaming/StreamConfigForm';

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
          <StationSelector 
            stations={stations}
            selectedStation={selectedStation}
            onStationChange={handleStationChange}
            currentStation={currentStation}
          />
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
              <StreamConfigForm
                currentStation={currentStation}
                streamUrl={streamUrl}
                streamPort={streamPort}
                streamPassword={streamPassword}
                setStreamUrl={setStreamUrl}
                setStreamPort={setStreamPort}
                setStreamPassword={setStreamPassword}
                handleSubmit={handleSubmit}
              />
            </TabsContent>
            
            <TabsContent value="details">
              <Card>
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
              </Card>
            </TabsContent>
            
            <TabsContent value="instructions">
              <Card>
                <StreamingInstructions
                  stationName={currentStation?.name || 'your station'}
                  streamUrl={currentStation?.streamDetails?.url}
                  streamPort={currentStation?.streamDetails?.port}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default StreamingSetup;
