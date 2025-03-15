
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Upload, FileMusic, X } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Max file size: 250MB in bytes
const MAX_FILE_SIZE = 262144000;

const UploadTrack: React.FC = () => {
  const { isAuthenticated, user, users } = useAuth();
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
  
  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  
  // Get list of approved hosts
  const hostUsers = users.filter(u => u.isRadioHost && u.approved);
  
  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to upload tracks",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Check if user is a host
    if (user && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only registered hosts can upload tracks",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    // Set current user as default artist
    if (user) {
      setSelectedArtistId(user.id);
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  // Handle cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle audio file selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Maximum file size is 250MB",
          variant: "destructive"
        });
        return;
      }
      
      setAudioFile(file);
    }
  };
  
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
      // Find the selected artist name
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
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Upload Track</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Upload your mix</CardTitle>
              <CardDescription>
                Share your music with the Latin Mix Masters community
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Track title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Mix Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter the title of your mix"
                    required
                  />
                </div>
                
                {/* Artist selection dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="artist">DJ Name</Label>
                  <Select
                    value={selectedArtistId}
                    onValueChange={setSelectedArtistId}
                  >
                    <SelectTrigger id="artist">
                      <SelectValue placeholder="Select a DJ" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostUsers.map((hostUser) => (
                        <SelectItem key={hostUser.id} value={hostUser.id}>
                          {hostUser.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Genre selection */}
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={selectedGenre}
                    onValueChange={setSelectedGenre}
                  >
                    <SelectTrigger id="genre">
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map((genre) => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Cover image upload */}
                <div className="space-y-2">
                  <Label>Cover Image</Label>
                  <div className="flex items-center gap-4">
                    {coverPreview ? (
                      <div className="relative w-32 h-32 rounded-md overflow-hidden">
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6"
                          onClick={() => {
                            setCoverPreview('');
                            setCoverImage(null);
                            if (coverInputRef.current) coverInputRef.current.value = '';
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="h-32 w-32"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center">
                          <Upload className="h-8 w-8 mb-2" />
                          <span>Upload cover</span>
                        </div>
                      </Button>
                    )}
                    <input
                      ref={coverInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Audio file upload */}
                <div className="space-y-2">
                  <Label>Audio File (Max 250MB)</Label>
                  <div className="flex items-center gap-4">
                    {audioFile ? (
                      <div className="flex-1 bg-muted rounded-md p-3 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <FileMusic className="text-blue" />
                          <span className="font-medium truncate">{audioFile.name}</span>
                          <span className="text-muted-foreground text-sm">
                            ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setAudioFile(null);
                            if (audioInputRef.current) audioInputRef.current.value = '';
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 py-8"
                        onClick={() => audioInputRef.current?.click()}
                      >
                        <div className="flex flex-col items-center">
                          <Music className="h-8 w-8 mb-2" />
                          <span>Select audio file</span>
                          <span className="text-xs text-muted-foreground mt-1">MP3, max 250MB</span>
                        </div>
                      </Button>
                    )}
                    <input
                      ref={audioInputRef}
                      type="file"
                      accept=".mp3,audio/mp3"
                      onChange={handleAudioChange}
                      className="hidden"
                    />
                  </div>
                </div>
                
                {/* Submit button */}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadTrack;
