
import { useState, useCallback, FormEvent } from 'react';
import { useTrack } from './useTrackContext';
import { useAuth } from '@/contexts/AuthContext';
import { useFileHandling } from './upload';
import { useToast } from './use-toast';
import { v4 as uuidv4 } from 'uuid';

export const useTrackUploadForm = () => {
  const { addTrack } = useTrack();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileHandling = useFileHandling();
  
  // Form fields
  const [title, setTitle] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  
  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [s3Configured] = useState(true); // This would be from a config check in a real app
  
  // Form state
  const [formState, setFormState] = useState({
    title: '',
    artist: '',
    genre: ''
  });
  
  const setSelectedFile = (file: File | null) => {
    // This is a placeholder function to satisfy UploadForm
    console.log('Selected file:', file);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to upload tracks.",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !selectedArtistId || !selectedGenre || !fileHandling.coverImage || !fileHandling.audioFile) {
      toast({
        title: "Incomplete Form",
        description: "Please fill out all required fields.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadError('');
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
      
      setCoverProgress(prev => {
        if (prev >= 100) {
          return 100;
        }
        return prev + 10;
      });
    }, 500);
    
    // Simulate track upload completion
    setTimeout(() => {
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      try {
        const newTrack = {
          id: uuidv4(),
          title,
          artist: selectedArtistId,
          artistId: selectedArtistId,
          genre: selectedGenre,
          coverImage: fileHandling.coverPreview || '/placeholder.png',
          audioFile: URL.createObjectURL(fileHandling.audioFile),
          audioUrl: URL.createObjectURL(fileHandling.audioFile),
          fileSize: fileHandling.audioFile?.size || 0,
          uploadedBy: user.id,
          uploadDate: new Date().toISOString(),
          likes: 0,
          duration: 180, // Default duration in seconds,
          playCount: 0,
          plays: 0
        };
        
        addTrack(newTrack);
        
        toast({
          title: "Upload Successful",
          description: "Your track has been uploaded successfully!"
        });
        
        // Reset form
        setTitle('');
        setSelectedArtistId('');
        setSelectedGenre('');
        fileHandling.setCoverImage(null);
        fileHandling.setAudioFile(null);
        fileHandling.setCoverPreview('');
        
        setIsUploading(false);
        setUploadProgress(0);
        setCoverProgress(0);
      } catch (error) {
        console.error('Upload error:', error);
        setUploadError('Failed to upload track. Please try again.');
        setIsUploading(false);
      }
    }, 3000);
  };
  
  return {
    // Form fields and state
    formFields: {
      title,
      setTitle,
      selectedArtistId,
      setSelectedArtistId,
      selectedGenre,
      setSelectedGenre
    },
    fileHandling,
    formState,
    setFormState,
    // Upload state
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    // Handlers
    handleSubmit,
    handleInputChange,
    setSelectedFile,
    // Limits
    maxAudioFileSize: fileHandling.maxAudioFileSize,
    maxImageFileSize: fileHandling.maxImageFileSize
  };
};

export default useTrackUploadForm;
