
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { FileUpload } from '@/models/RadioStation';

interface StationImagePreviewProps {
  imageUrl?: string;
  uploadPreview?: FileUpload | null;
  stationName: string;
  currentImage?: string;
}

const StationImagePreview: React.FC<StationImagePreviewProps> = ({
  imageUrl,
  uploadPreview,
  stationName,
  currentImage
}) => {
  return (
    <div className="bg-gray-100 rounded-md p-4 flex justify-center">
      <div className="aspect-video w-full max-w-[300px] rounded overflow-hidden border">
        {uploadPreview?.dataUrl ? (
          <img 
            src={uploadPreview.dataUrl} 
            alt={`${stationName} cover preview`}
            className="w-full h-full object-cover"
          />
        ) : imageUrl ? (
          <img 
            src={imageUrl} 
            alt={`${stationName} cover`}
            className="w-full h-full object-cover"
          />
        ) : currentImage ? (
          <img 
            src={currentImage} 
            alt={`${stationName} current cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <ImageIcon className="w-12 h-12 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StationImagePreview;
