
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RadioStation, BookingSlot } from '@/models/RadioStation';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';
import { format } from 'date-fns';

interface RadioShowsTabProps {
  hostStations: RadioStation[];
  hostBookings: BookingSlot[];
  startListening: (stationId: string) => void;
}

const RadioShowsTab: React.FC<RadioShowsTabProps> = ({ 
  hostStations, 
  hostBookings,
  startListening 
}) => {
  return (
    <div className="space-y-6">
      {hostStations.length > 0 ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Hosted Radio Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hostStations.map(station => (
              <Card key={station.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col h-full">
                    <h3 className="text-lg font-semibold">{station.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {station.description}
                    </p>
                    <Button 
                      className="mt-auto" 
                      onClick={() => startListening(station.id)}
                    >
                      Listen Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">This DJ doesn't host any radio stations.</p>
          </CardContent>
        </Card>
      )}

      {hostBookings.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Upcoming Shows</h2>
          <div className="space-y-4">
            {hostBookings.map(booking => (
              <Card key={booking.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{booking.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(booking.startTime), "MMM dd, yyyy 'at' h:mm a")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Station: {booking.stationName}
                      </p>
                    </div>
                    {booking.stationId && (
                      <Button onClick={() => startListening(booking.stationId)}>
                        Listen
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {hostStations.length === 0 && hostBookings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Radio className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No radio shows found for this DJ.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RadioShowsTab;
