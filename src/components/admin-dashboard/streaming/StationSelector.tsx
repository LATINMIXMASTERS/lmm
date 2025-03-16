
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioStation } from '@/models/RadioStation';

interface StationSelectorProps {
  stations: RadioStation[];
  selectedStation: string;
  onStationChange: (stationId: string) => void;
  currentStation: RadioStation | null;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStation,
  onStationChange,
  currentStation
}) => {
  return (
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
              onValueChange={onStationChange}
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
  );
};

export default StationSelector;
