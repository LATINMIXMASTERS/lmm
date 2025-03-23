
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { uploadFileToS3, isS3Configured } from '@/services/s3UploadService';

// Max file size: 250MB in bytes
export const MAX_FILE_SIZE = 262144000;

export const useTrackUploadForm = () => {
  const { user, users } = useAuth();
  const { addTrack } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [s3Configured, setS3Configured] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Check if S3 is configured when component mounts
  useEffect(() => {
    const s3Status = isS3Configured();
    console.log('S3 configuration status:', s3Status);
    setS3Configured(s3Status);
  }, []);
  
  // Set current user as default artist when component mounts
  useEffect(() => {
    if (user) {
      setSelectedArtistId(user.id);
    }
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to upload tracks",
        variant: "destructive"
      });
      return;
    }
    
    if (!title || !selectedArtistId || !selectedGenre || !coverImage || !audioFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload required files",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log('Starting upload process...');
      // Find the selected artist name
      const selectedArtist = users.find(u => u.id === selectedArtistId);
      if (!selectedArtist) {
        throw new Error("Selected artist not found");
      }
      
      // Upload cover image to S3
      setUploadProgress(0);
      setCoverProgress(0);
      console.log('Uploading cover image...');
      const coverUploadResult = await uploadFileToS3(coverImage, 'covers', setCoverProgress);
      
      if (!coverUploadResult.success) {
        throw new Error(`Cover image upload failed: ${coverUploadResult.error}`);
      }
      
      // Upload audio file to S3
      console.log('Uploading audio file...');
      const audioUploadResult = await uploadFileToS3(audioFile, 'audio', setUploadProgress);
      
      if (!audioUploadResult.success) {
        throw new Error(`Audio file upload failed: ${audioUploadResult.error}`);
      }
      
      // Add track to our context
      const newTrack = {
        title,
        artist: selectedArtist.username,
        artistId: selectedArtistId,
        genre: selectedGenre,
        coverImage: coverUploadResult.url,
        audioFile: audioUploadResult.url,
        fileSize: audioFile.size,
        uploadedBy: user.id
      };
      
      console.log('Adding track to context:', newTrack);
      addTrack(newTrack);
      
      // Show success message
      toast({
        title: "Upload successful",
        description: "Your track has been uploaded successfully",
      });
      
      // Redirect to mixes page
      navigate('/mixes');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown upload error');
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your track",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    title,
    setTitle,
    selectedArtistId,
    setSelectedArtistId,
    selectedGenre,
    setSelectedGenre,
    coverImage,
    setCoverImage,
    audioFile,
    setAudioFile,
    coverPreview,
    setCoverPreview,
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    handleSubmit,
    maxFileSize: MAX_FILE_SIZE
  };
};
