
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RadioStation, FileUpload } from '@/models/RadioStation';
import StationImageUpload from './StationImageUpload';
import StationImageUrlInput from './StationImageUrlInput';
import StationImagePreview from './StationImagePreview';

interface StationImageCardProps {
  station: RadioStation;
  imageUrl: string;
  uploadPreview: FileUpload | null;
  onImageChange: (stationId: string, imageUrl: string) => void;
  onFileChange: (stationId: string, files: FileList | null) => void;
  onClearUpload: (stationId: string) => void;
  onSaveImage: (stationId: string) => void;
}

const StationImageCard: React.FC<StationImageCardProps> = ({
  station,
  imageUrl,
  uploadPreview,
  onImageChange,
  onFileChange,
  onClearUpload,
  onSaveImage
}) => {
  return (
    <div className="p-4 border rounded-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-lg">{station.name}</h3>
        <span className="text-sm text-gray-500">{station.genre}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          <StationImageUpload 
            stationId={station.id}
            uploadPreview={uploadPreview}
            onFileChange={onFileChange}
            onClearUpload={onClearUpload}
          />
          
          <StationImageUrlInput 
            stationId={station.id}
            imageUrl={imageUrl}
            onChange={onImageChange}
            disabled={!!uploadPreview}
          />
          
          <Button 
            onClick={() => onSaveImage(station.id)}
            className="mt-4 bg-blue hover:bg-blue-dark w-full"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Save Image
          </Button>
        </div>
        
        <StationImagePreview 
          imageUrl={imageUrl}
          uploadPreview={uploadPreview}
          stationName={station.name}
          currentImage={station.image}
        />
      </div>
    </div>
  );
};

export default StationImageCard;
