
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Save, Trash } from 'lucide-react';
import { RadioStation, FileUpload } from '@/models/RadioStation';
import StationImagePreview from './StationImagePreview';
import StationImageUrlInput from './StationImageUrlInput';
import StationImageUpload from './StationImageUpload';
import { uploadFileToS3, isS3Configured } from '@/services/s3UploadService';
import { useToast } from '@/hooks/use-toast';

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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);
  const { toast } = useToast();
  
  // Check S3 configuration on mount
  useEffect(() => {
    setS3Configured(isS3Configured());
  }, []);
  
  const handleUploadToS3 = async () => {
    if (!uploadPreview?.file) {
      toast({
        title: "No file selected",
        description: "Please select an image file to upload",
        variant: "destructive"
      });
      return;
    }
    
    if (!s3Configured) {
      toast({
        title: "S3 not configured",
        description: "Please configure S3 storage in the admin settings",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log(`Starting S3 upload for station ${station.id}...`);
      const result = await uploadFileToS3(
        uploadPreview.file, 
        `stations/${station.id}`, 
        setUploadProgress
      );
      
      if (result.success) {
        // Update with the S3 URL
        onImageChange(station.id, result.url);
        
        // Clear the upload preview
        onClearUpload(station.id);
        
        // Save the image
        onSaveImage(station.id);
        
        toast({
          title: "Upload Successful",
          description: "The image has been uploaded to S3 and saved"
        });
      } else {
        throw new Error(result.error || "Upload failed");
      }
    } catch (error) {
      console.error("S3 upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <StationImagePreview
              station={station}
              uploadPreview={uploadPreview}
            />
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <h3 className="text-lg font-semibold mb-2">{station.name}</h3>
            
            <StationImageUrlInput
              stationId={station.id}
              imageUrl={imageUrl}
              onChange={onImageChange}
              disabled={!!uploadPreview}
            />
            
            <StationImageUpload
              stationId={station.id}
              uploadPreview={uploadPreview}
              onFileChange={onFileChange}
              onClearUpload={onClearUpload}
            />
            
            {isUploading && (
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span>Uploading to S3...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              {s3Configured && uploadPreview && (
                <Button
                  variant="outline"
                  onClick={handleUploadToS3}
                  disabled={isUploading}
                  className="flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  Upload to S3
                </Button>
              )}
              
              <Button
                onClick={() => onSaveImage(station.id)}
                disabled={!imageUrl && !uploadPreview}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save Image
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { StationImageCard };
