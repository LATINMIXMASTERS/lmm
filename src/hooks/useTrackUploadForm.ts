
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

export interface TrackUploadFormReturn {
  title: string;
  setTitle: (title: string) => void;
  selectedArtistId: string;
  setSelectedArtistId: (id: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  coverImage: string;
  setCoverImage: (url: string) => void;
  audioFile: string;
  setAudioFile: (url: string) => void;
  coverPreview: string;
  setCoverPreview: (url: string) => void;
  isUploading: boolean;
  uploadProgress: number;
  coverProgress: number;
  s3Configured: boolean;
  uploadError: string | null;
  handleSubmit: (e: React.FormEvent) => void;
  maxAudioFileSize: number;
  maxImageFileSize: number;
  formState: FormState;
  isValid: boolean;
  error: string | null;
  success: boolean;
  submitting: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  resetForm: () => void;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
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

export const useTrackUploadForm = (onSuccess?: (track: Track) => void): TrackUploadFormReturn => {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [coverPreview, setCoverPreview] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [s3Configured] = useState(true); // Mock for demo
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { addTrack } = useTrack();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const maxAudioFileSize = 250 * 1024 * 1024; // 250MB
  const maxImageFileSize = 5 * 1024 * 1024; // 5MB
  
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
    accept: {
      'audio/*': []
    },
    maxFiles: 1
  });
  
  // Helper functions to expose individual form state setters
  const setTitle = (title: string) => setFormState(prev => ({ ...prev, title }));
  const setSelectedArtistId = (artistId: string) => setFormState(prev => ({ ...prev, artistId }));
  const setSelectedGenre = (genre: string) => setFormState(prev => ({ ...prev, genre }));
  const setCoverImage = (coverImage: string) => setFormState(prev => ({ ...prev, coverImage }));
  const setAudioFile = (audioFile: string) => setFormState(prev => ({ ...prev, audioFile }));
  
  // Modify the handleSubmit function to include audioUrl
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || submitting) {
      return;
    }
    
    setSubmitting(true);
    setIsUploading(true);
    
    try {
      // Simulate upload progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(progressInterval);
        }
      }, 300);
      
      // For demo purposes, we'll just use the file directly
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
        description: '', // Add description field to match what's expected
        duration: Math.floor(Math.random() * 300) + 180 // Random duration between 3-8 minutes
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
      setUploadError("Failed to upload track. Please try again.");
      
      toast({
        title: "Upload failed",
        description: "There was an error uploading your track. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
      setCoverProgress(0);
    }
  };
  
  return {
    // Direct access to form fields and setters
    title: formState.title,
    setTitle,
    selectedArtistId: formState.artistId,
    setSelectedArtistId,
    selectedGenre: formState.genre,
    setSelectedGenre,
    coverImage: formState.coverImage,
    setCoverImage,
    audioFile: formState.audioFile,
    setAudioFile,
    
    // UI state
    coverPreview,
    setCoverPreview,
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    
    // Form capabilities
    handleSubmit,
    maxAudioFileSize,
    maxImageFileSize,
    
    // Original form state
    formState,
    isValid,
    error,
    success,
    submitting,
    handleInputChange,
    getRootProps,
    getInputProps,
    isDragActive,
    resetForm,
    setFormState
  };
};
