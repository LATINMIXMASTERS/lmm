
import { useState, useEffect } from 'react';
import { uploadFileToS3, isS3Configured } from '@/services/s3UploadService';
import { useToast } from '@/hooks/use-toast';

export interface UploadResult {
  success: boolean;
  url: string;
  error?: string;
}

export const useS3Upload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [s3Configured, setS3Configured] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if S3 is configured when component mounts
  useEffect(() => {
    const s3Status = isS3Configured();
    console.log('S3 configuration status:', s3Status);
    setS3Configured(s3Status);
  }, []);

  const uploadFiles = async (
    coverImage: File | null,
    audioFile: File | null
  ): Promise<{ coverUrl: string; audioUrl: string } | null> => {
    if (!coverImage || !audioFile) {
      toast({
        title: "Missing files",
        description: "Both cover image and audio file are required",
        variant: "destructive"
      });
      return null;
    }

    // Check if audio file is too large without S3 configuration
    if (!s3Configured && audioFile.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large for local storage",
        description: "S3 storage is not configured and audio file exceeds 5MB. Please configure S3 storage or use a smaller file.",
        variant: "destructive"
      });
      setUploadError("File too large for local storage. Please configure S3 storage or use a smaller file.");
      return null;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadProgress(0);
    setCoverProgress(0);

    try {
      // Upload cover image
      console.log('Uploading cover image...', coverImage.size / 1024, 'KB');
      const coverUploadResult = await uploadFileToS3(coverImage, 'covers', setCoverProgress);
      
      if (!coverUploadResult.success) {
        throw new Error(`Cover image upload failed: ${coverUploadResult.error}`);
      }
      
      // Upload audio file
      console.log('Uploading audio file...', audioFile.size / (1024 * 1024), 'MB');
      const audioUploadResult = await uploadFileToS3(audioFile, 'audio', setUploadProgress);
      
      if (!audioUploadResult.success) {
        throw new Error(`Audio file upload failed: ${audioUploadResult.error}`);
      }

      return {
        coverUrl: coverUploadResult.url,
        audioUrl: audioUploadResult.url
      };
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      setUploadError(errorMessage);
      
      // Provide more helpful error messages based on the error content
      if (errorMessage.includes('quota') || errorMessage.includes('storage')) {
        toast({
          title: "Storage limit exceeded",
          description: "The file is too large for browser storage. Please configure S3 or use a smaller file.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Upload failed",
          description: errorMessage,
          variant: "destructive"
        });
      }
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadFiles,
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    setUploadError
  };
};
