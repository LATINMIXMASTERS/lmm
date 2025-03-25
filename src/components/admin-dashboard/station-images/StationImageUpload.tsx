
import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/models/RadioStation';
import { compressImage } from '@/utils/imageUtils';
import { useToast } from '@/hooks/use-toast';

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
  const [isCompressing, setIsCompressing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  
  const triggerFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    processFile(files[0]);
  };
  
  const processFile = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    // Original file size check (we'll let the parent component handle other validations)
    if (file.size > 10 * 1024 * 1024) { // 10MB max for original file
      toast({
        title: "File too large",
        description: "Image size should be less than 10MB",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsCompressing(true);
      
      // Compress the image (max 800KB, 1200px max dimension, 70% quality)
      const compressedFile = await compressImage(file, {
        maxWidthOrHeight: 1200,
        quality: 0.7,
        maxSizeKB: 800
      });
      
      // Create a FileList-like object with our compressed file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressedFile);
      const compressedFileList = dataTransfer.files;
      
      // Pass the compressed file to the parent component
      onFileChange(stationId, compressedFileList);
      
      // Show compression info if the file was actually compressed
      if (compressedFile.size < file.size) {
        const originalSizeKB = (file.size / 1024).toFixed(1);
        const compressedSizeKB = (compressedFile.size / 1024).toFixed(1);
        toast({
          title: "Image compressed",
          description: `Reduced from ${originalSizeKB}KB to ${compressedSizeKB}KB`,
        });
      }
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        title: "Compression failed",
        description: "Using original file instead",
        variant: "destructive"
      });
      // Fall back to original file
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      onFileChange(stationId, dataTransfer.files);
    } finally {
      setIsCompressing(false);
    }
  };
  
  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };
  
  return (
    <div className="mb-4">
      <Label className="mb-2 block">Image Upload</Label>
      <div className="flex items-center gap-2">
        <div 
          className={`w-full ${isDragging ? 'bg-blue-50 border-blue' : ''}`}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Button 
            type="button"
            variant="outline"
            onClick={triggerFileInputClick}
            className={`w-full flex justify-center py-6 transition-colors ${isDragging ? 'border-dashed border-blue bg-blue-50' : 'border-dashed'}`}
            disabled={isCompressing}
          >
            <Upload className="w-5 h-5 mr-2" />
            {isCompressing ? 'Compressing...' : isDragging ? 'Drop Image Here' : 'Choose Image File or Drag & Drop'}
          </Button>
        </div>
        <input
          type="file"
          id={`file-upload-${stationId}`}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
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
              <span className="text-gray-500 ml-1">
                ({(uploadPreview.file.size / 1024).toFixed(1)}KB)
              </span>
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
