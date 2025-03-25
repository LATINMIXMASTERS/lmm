
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { useS3Upload } from './upload/useS3Upload';
import { useFileHandling } from './upload/useFileHandling';
import { useTrackFormState } from './upload/useTrackFormState';

export const useTrackUploadForm = () => {
  const { user, users } = useAuth();
  const { addTrack } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Use our new modular hooks
  const {
    title, setTitle,
    selectedArtistId, setSelectedArtistId,
    selectedGenre, setSelectedGenre,
    resetForm
  } = useTrackFormState();
  
  const {
    coverImage, setCoverImage,
    audioFile, setAudioFile,
    coverPreview, setCoverPreview,
    maxFileSize
  } = useFileHandling();
  
  const {
    uploadFiles,
    isUploading,
    uploadProgress,
    coverProgress,
    s3Configured,
    uploadError,
    setUploadError
  } = useS3Upload();
  
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
    
    // Verify that the user is only uploading as themselves or they are an admin
    if (selectedArtistId !== user.id && !user.isAdmin) {
      toast({
        title: "Permission denied",
        description: "You can only upload tracks to your own profile",
        variant: "destructive"
      });
      return;
    }
    
    try {
      console.log('Starting upload process...');
      // Find the selected artist name
      const selectedArtist = users.find(u => u.id === selectedArtistId);
      if (!selectedArtist) {
        throw new Error("Selected artist not found");
      }
      
      // Upload files and get URLs
      const uploadResult = await uploadFiles(coverImage, audioFile);
      if (!uploadResult) {
        return; // Error already handled in uploadFiles
      }
      
      // Add track to our context
      const newTrack = {
        title,
        artist: selectedArtist.username,
        artistId: selectedArtistId,
        genre: selectedGenre,
        coverImage: uploadResult.coverUrl,
        audioFile: uploadResult.audioUrl,
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
      
      // Reset form and redirect to mixes page
      resetForm();
      navigate('/mixes');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError(error instanceof Error ? error.message : 'Unknown upload error');
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "There was an error uploading your track",
        variant: "destructive"
      });
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
    maxFileSize
  };
};
