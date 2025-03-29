
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Max file sizes in bytes
export const MAX_AUDIO_FILE_SIZE = 262144000; // 250MB
export const MAX_IMAGE_FILE_SIZE = 1048576; // 1MB

export const useFileHandling = () => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const { toast } = useToast();

  const validateAudioFile = (file: File): boolean => {
    if (file.size > MAX_AUDIO_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum audio file size is 250MB",
        variant: "destructive"
      });
      return false;
    }
    
    // Add more validation if needed (file type, etc.)
    return true;
  };

  const validateImageFile = (file: File): boolean => {
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      toast({
        title: "Image too large",
        description: "Maximum image size is 1MB",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleAudioFileChange = (file: File | null) => {
    if (file && !validateAudioFile(file)) {
      return;
    }
    setAudioFile(file);
  };

  const handleCoverImageChange = (file: File | null, previewUrl?: string) => {
    if (file && !validateImageFile(file)) {
      return;
    }
    
    setCoverImage(file);
    if (previewUrl) {
      setCoverPreview(previewUrl);
    } else if (!file) {
      setCoverPreview('');
    }
  };

  return {
    coverImage,
    setCoverImage: handleCoverImageChange,
    audioFile,
    setAudioFile: handleAudioFileChange,
    coverPreview,
    setCoverPreview,
    maxAudioFileSize: MAX_AUDIO_FILE_SIZE,
    maxImageFileSize: MAX_IMAGE_FILE_SIZE
  };
};
