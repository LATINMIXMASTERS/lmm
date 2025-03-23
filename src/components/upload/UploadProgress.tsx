
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface UploadProgressProps {
  isUploading: boolean;
  coverProgress: number;
  uploadProgress: number;
  uploadError: string | null;
}

const UploadProgress: React.FC<UploadProgressProps> = ({
  isUploading,
  coverProgress,
  uploadProgress,
  uploadError
}) => {
  if (!isUploading && !uploadError) return null;
  
  return (
    <div className="space-y-4">
      {isUploading && (
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading cover image...</span>
              <span>{coverProgress}%</span>
            </div>
            <Progress value={coverProgress} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm mb-1">
              <span>Uploading audio file...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        </div>
      )}
      
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default UploadProgress;
