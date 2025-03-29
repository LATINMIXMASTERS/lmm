
import React from 'react';
import { ImageIcon } from 'lucide-react';
import { FileUpload, RadioStation } from '@/models/RadioStation';

interface StationImagePreviewProps {
  station: RadioStation;
  uploadPreview: FileUpload | null;
}

const StationImagePreview: React.FC<StationImagePreviewProps> = ({
  station,
  uploadPreview
}) => {
  // Determine what to display as the preview
  const getPreviewImage = () => {
    if (uploadPreview && uploadPreview.dataUrl) {
      return uploadPreview.dataUrl;
    }
    
    if (station.s3Image) {
      return station.s3Image;
    }
    
    if (station.image) {
      return station.image;
    }
    
    return null;
  };
  
  const previewImage = getPreviewImage();
  
  return (
    <div className="flex flex-col items-center">
      <h4 className="mb-2 font-medium">Preview</h4>
      <div className="bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden aspect-square w-full max-w-64">
        {previewImage ? (
          <img 
            src={previewImage} 
            alt={`${station.name} preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center p-4">
              <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
              <p className="text-sm text-gray-500 mt-2">No image</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-2 text-sm text-gray-500">
        {station.image ? 'Current image will be replaced when saved' : 'No current image set'}
      </div>
    </div>
  );
};

export default StationImagePreview;
