
import React, { useEffect, useState } from 'react';
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
  const [localUrl, setLocalUrl] = useState(imageUrl);

  useEffect(() => {
    setLocalUrl(imageUrl);
  }, [imageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalUrl(newValue);
  };

  const handleBlur = () => {
    if (localUrl !== imageUrl) {
      onChange(stationId, localUrl);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={`station-image-${stationId}`} className="mb-2 block">
        Enter Image URL
      </Label>
      <Input
        id={`station-image-${stationId}`}
        value={localUrl}
        onChange={handleChange}
        onBlur={handleBlur}
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
