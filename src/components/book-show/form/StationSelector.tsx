
import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioStation } from '@/models/RadioStation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface StationSelectorProps {
  stations: RadioStation[];
  selectedStation: string;
  setSelectedStation: (stationId: string) => void;
}

const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStation,
  setSelectedStation,
}) => {
  return (
    <div>
      <Label htmlFor="station">Select Station</Label>
      <Select value={selectedStation} onValueChange={setSelectedStation}>
        <SelectTrigger>
          <SelectValue placeholder="Select a station" />
        </SelectTrigger>
        <SelectContent>
          {stations.map((station) => (
            <SelectItem key={station.id} value={station.id}>
              {station.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StationSelector;
