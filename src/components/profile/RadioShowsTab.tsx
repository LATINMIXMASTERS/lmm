
import React from 'react';
import { Radio, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioStation } from '@/models/RadioStation';

interface RadioShowsTabProps {
  hostStations: RadioStation[];
  startListening: (stationId: string) => void;
}

const RadioShowsTab: React.FC<RadioShowsTabProps> = ({ hostStations, startListening }) => {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Radio Shows</h2>
      
      {hostStations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hostStations.map(station => (
            <Card key={station.id}>
              <div className="flex md:flex-row flex-col p-4 gap-4">
                <div className="w-full md:w-1/3 aspect-video rounded-md overflow-hidden">
                  <img 
                    src={station.image} 
                    alt={station.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{station.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {station.genre}
                  </p>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{station.broadcastTime || "24/7 Broadcast"}</span>
                  </div>
                  <Button 
                    onClick={() => startListening(station.id)}
                    variant="default"
                    className="w-full"
                  >
                    <Radio className="mr-2 h-4 w-4" />
                    Listen Now
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This DJ doesn't have any upcoming radio shows.</p>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default RadioShowsTab;
