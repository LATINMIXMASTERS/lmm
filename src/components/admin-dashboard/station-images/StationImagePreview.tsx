
import React, { useState, useEffect } from 'react';
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
  const [imageError, setImageError] = useState(false);
  
  // Determine which image to show
  const displayImage = uploadPreview?.dataUrl || 
                      (imageUrl && !imageError ? imageUrl : null) || 
                      (currentImage && !imageError ? currentImage : null);
  
  const handleImageError = () => {
    console.error("Failed to load image:", displayImage);
    setImageError(true);
  };
  
  // Reset error state when source changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl, uploadPreview, currentImage]);
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-md p-4 flex justify-center">
      <div className="aspect-video w-full max-w-[300px] rounded overflow-hidden border">
        {displayImage ? (
          <img 
            src={displayImage} 
            alt={`${stationName} cover`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
            <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StationImagePreview;
