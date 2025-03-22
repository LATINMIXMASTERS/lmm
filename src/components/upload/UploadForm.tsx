
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import TrackInfoFields from './TrackInfoFields';
import CoverImageUpload from './CoverImageUpload';
import AudioFileUpload from './AudioFileUpload';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

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
  
  // Set current user as default artist when component mounts
  React.useEffect(() => {
    if (user) {
      setSelectedArtistId(user.id);
    }
  }, [user]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!title || !selectedArtistId || !selectedGenre || !coverImage || !audioFile) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields and upload required files",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Find the selected artist name from the AuthContext
      const { users } = useAuth();
      const selectedArtist = users.find(u => u.id === selectedArtistId);
      if (!selectedArtist) {
        throw new Error("Selected DJ not found");
      }
      
      // In a real app, we would upload files to a server here
      // For this demo, we'll create URLs
      const coverUrl = coverPreview; // Using the data URL as our "hosted" URL
      
      // For audio, in a real app we'd upload to a server
      // Here we just pretend we have a URL
      const audioUrl = `/demo-uploads/${audioFile.name}`;
      
      // Add track to our context
      addTrack({
        title,
        artist: selectedArtist.username,
        artistId: selectedArtistId,
        genre: selectedGenre,
        coverImage: coverUrl,
        audioFile: audioUrl,
        fileSize: audioFile.size,
        uploadedBy: user.id
      });
      
      // Redirect to mixes page
      navigate('/mixes');
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "There was an error uploading your track",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
