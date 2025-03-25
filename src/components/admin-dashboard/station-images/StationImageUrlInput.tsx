
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StationImageUrlInputProps {
  stationId: string;
  imageUrl: string;
  onChange: (stationId: string, imageUrl: string) => void;
  disabled: boolean;
}

const StationImageUrlInput: React.FC<StationImageUrlInputProps> = ({
  stationId,
  imageUrl,
  onChange,
  disabled
}) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`station-image-${stationId}`} className="mb-2 block">
        Or Enter Image URL
      </Label>
      <Input
        id={`station-image-${stationId}`}
        value={imageUrl || ''}
        onChange={(e) => onChange(stationId, e.target.value)}
        placeholder="https://example.com/image.jpg"
        className="w-full"
        disabled={disabled}
      />
      <p className="text-xs text-gray-500">
        {disabled 
          ? "URL input is disabled while a file is selected for upload" 
          : "Enter a URL for the station cover image"}
      </p>
    </div>
  );
};

export default StationImageUrlInput;
