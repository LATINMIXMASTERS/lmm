
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// Max file size: 250MB in bytes
export const MAX_FILE_SIZE = 262144000;

export const useFileHandling = () => {
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const { toast } = useToast();

  const validateAudioFile = (file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 250MB",
        variant: "destructive"
      });
      return false;
    }
    
    // Add more validation if needed (file type, etc.)
    return true;
  };

  const handleAudioFileChange = (file: File | null) => {
    if (file && !validateAudioFile(file)) {
      return;
    }
    setAudioFile(file);
  };

  const handleCoverImageChange = (file: File | null, previewUrl?: string) => {
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
    maxFileSize: MAX_FILE_SIZE
  };
};
