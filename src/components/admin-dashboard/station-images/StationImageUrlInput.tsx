
import React from 'react';
import { Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StationImageUrlInputProps {
  stationId: string;
  imageUrl: string;
  onChange: (stationId: string, imageUrl: string) => void;
  disabled?: boolean;
}

const StationImageUrlInput: React.FC<StationImageUrlInputProps> = ({
  stationId,
  imageUrl,
  onChange,
  disabled = false
}) => {
  return (
    <div className="mb-4">
      <Label htmlFor={`image-url-${stationId}`} className="mb-2 block">Image URL</Label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Globe className="h-4 w-4 text-gray-500" />
        </div>
        <Input
          id={`image-url-${stationId}`}
          type="url"
          placeholder="https://example.com/image.jpg"
          value={imageUrl}
          onChange={(e) => onChange(stationId, e.target.value)}
          className="pl-10"
          disabled={disabled}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {disabled ? "URL input is disabled while a file is selected" : "Enter a direct URL to an image"}
      </div>
    </div>
  );
};

export default StationImageUrlInput;
