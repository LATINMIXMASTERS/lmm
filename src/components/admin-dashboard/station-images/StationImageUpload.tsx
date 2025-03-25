
import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/models/RadioStation';

interface StationImageUploadProps {
  stationId: string;
  uploadPreview: FileUpload | null;
  onFileChange: (stationId: string, files: FileList | null) => void;
  onClearUpload: (stationId: string) => void;
}

const StationImageUpload: React.FC<StationImageUploadProps> = ({
  stationId,
  uploadPreview,
  onFileChange,
  onClearUpload
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  const triggerFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className="mb-4">
      <Label className="mb-2 block">Image Upload</Label>
      <div className="flex items-center gap-2">
        <Button 
          type="button"
          variant="outline"
          onClick={triggerFileInputClick}
          className="w-full flex justify-center py-6 border-dashed"
        >
          <Upload className="w-5 h-5 mr-2" />
          Choose Image File
        </Button>
        <input
          type="file"
          id={`file-upload-${stationId}`}
          className="hidden"
          accept="image/*"
          onChange={(e) => onFileChange(stationId, e.target.files)}
          ref={fileInputRef}
        />
      </div>
      
      {uploadPreview && (
        <div className="mt-2 mb-4 flex items-center gap-2">
          <div className="flex-1 bg-blue-50 rounded p-2 flex items-center">
            <div className="w-8 h-8 mr-2 rounded overflow-hidden">
              <img 
                src={uploadPreview.dataUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-sm truncate">
              {uploadPreview.file.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClearUpload(stationId)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StationImageUpload;
