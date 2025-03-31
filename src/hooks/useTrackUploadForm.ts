import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useToast } from '@/hooks/use-toast';
import { useTrack } from '@/hooks/useTrackContext';
import { useAuth } from '@/contexts/AuthContext';
import { Track } from '@/models/Track';

interface FormState {
  title: string;
  artist: string;
  artistId: string;
  genre: string;
  coverImage: string;
  audioFile: string;
  fileSize: number;
}

const initialFormState: FormState = {
  title: '',
  artist: '',
  artistId: '',
  genre: '',
  coverImage: '/placeholder-album.png',
  audioFile: '',
  fileSize: 0
};

export const useTrackUploadForm = (onSuccess?: (track: Track) => void) => {
  const [formState, setFormState] = useState(initialFormState);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { addTrack } = useTrack();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Validation function
  const validateForm = useCallback(() => {
    const requiredFieldsFilled = formState.title && formState.artist && formState.genre && formState.audioFile;
    setIsValid(!!requiredFieldsFilled);
  }, [formState.title, formState.artist, formState.genre, formState.audioFile]);
  
  // Reset form to initial state
  const resetForm = useCallback(() => {
    setFormState(initialFormState);
    setError(null);
    setIsValid(false);
  }, []);
  
  // Handle form input changes
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: value
    }));
    validateForm();
  }, [validateForm]);
  
  // Handle file drop with Dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    if (file) {
      const audioURL = URL.createObjectURL(file);
      setFormState(prevState => ({
        ...prevState,
        audioFile: audioURL,
        fileSize: file.size
      }));
      validateForm();
    }
  }, [validateForm]);
  
  // Configure Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: 'audio/*',
    maxFiles: 1
  });
  
  // Modify the handleSubmit function to include audioUrl
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || submitting) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // For demo purposes, we'll just use the file directly
      // In a real app, you would upload to a server/storage
      const trackData = {
        title: formState.title,
        artist: formState.artist,
        artistId: formState.artistId || user?.id || 'unknown',
        genre: formState.genre,
        coverImage: formState.coverImage || '/placeholder-album.png',
        audioFile: formState.audioFile,
        audioUrl: formState.audioFile, // Set audioUrl to match audioFile for now
        fileSize: formState.fileSize || 0,
        uploadedBy: user?.id || 'unknown',
        uploadDate: new Date().toISOString()
      };
      
      const newTrack = addTrack(trackData);
      
      setSuccess(true);
      resetForm();
      
      toast({
        title: "Track uploaded successfully!",
        description: `Your track "${newTrack.title}" is now available on the platform.`
      });
      
      if (onSuccess) {
        onSuccess(newTrack);
      }
    } catch (error) {
      console.error("Error uploading track:", error);
      setError("Failed to upload track. Please try again.");
      
      toast({
        title: "Upload failed",
        description: "There was an error uploading your track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return {
    formState,
    isValid,
    error,
    success,
    submitting,
    handleInputChange,
    handleSubmit,
    getRootProps,
    getInputProps,
    isDragActive,
    resetForm,
    setFormState
  };
};
