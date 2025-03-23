
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import TrackInfoFields from './TrackInfoFields';
import CoverImageUpload from './CoverImageUpload';
import AudioFileUpload from './AudioFileUpload';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { uploadFileToS3, isS3Configured } from '@/services/s3UploadService';

// Max file size: 250MB in bytes
const MAX_FILE_SIZE = 262144000;

const UploadForm: React.FC = () => {
  const { user } = useAuth();
  const { genres, addTrack } = useTrack();
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
      const { users } = useAuth();
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!s3Configured && (
        <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            S3 storage is not configured. File uploads will use local storage instead. 
            To configure S3 storage, go to Admin Dashboard and set up your S3 provider.
          </AlertDescription>
        </Alert>
      )}
      
      <TrackInfoFields 
        title={title}
        setTitle={setTitle}
        selectedArtistId={selectedArtistId}
        setSelectedArtistId={setSelectedArtistId}
        selectedGenre={selectedGenre}
        setSelectedGenre={setSelectedGenre}
      />
      
      <CoverImageUpload
        coverPreview={coverPreview}
        setCoverPreview={setCoverPreview}
        setCoverImage={setCoverImage}
      />
      
      <AudioFileUpload
        audioFile={audioFile}
        setAudioFile={setAudioFile}
        maxFileSize={MAX_FILE_SIZE}
      />
      
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
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isUploading || !title || !selectedArtistId || !selectedGenre || !coverImage || !audioFile}
      >
        {isUploading ? (
          <>Uploading...</>
        ) : (
          <>
            <Upload className="w-4 h-4 mr-2" />
            Upload Mix
          </>
        )}
      </Button>
    </form>
  );
};

export default UploadForm;
