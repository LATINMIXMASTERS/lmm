import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Music, Save } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const EditTrack: React.FC = () => {
  const { trackId } = useParams<{ trackId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { tracks, genres, updateTrack, canEditTrack } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [trackData, setTrackData] = useState({
    title: '',
    description: '',
    genre: '',
    artist: '',
    audioFile: '',
    coverImage: ''
  });
  
  useEffect(() => {
    if (!trackId) return;
    
    const track = tracks.find(t => t.id === trackId);
    if (!track) {
      toast({
        title: "Track not found",
        description: "The track you're trying to edit doesn't exist",
        variant: "destructive"
      });
      navigate('/mixes');
      return;
    }
    
    if (!canEditTrack(trackId)) {
      toast({
        title: "Permission denied",
        description: "You don't have permission to edit this track",
        variant: "destructive"
      });
      navigate('/mixes');
      return;
    }
    
    setTrackData({
      title: track.title || '',
      description: track.description || '',
      genre: track.genre || '',
      artist: track.artist || '',
      audioFile: track.audioFile || '',
      coverImage: track.coverImage || ''
    });
  }, [trackId, tracks, navigate, canEditTrack]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTrackData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGenreChange = (value: string) => {
    setTrackData(prev => ({
      ...prev,
      genre: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !trackId) {
      return;
    }
    
    const success = updateTrack(trackId, {
      title: trackData.title,
      description: trackData.description,
      genre: trackData.genre,
      artist: trackData.artist,
      coverImage: trackData.coverImage
    });
    
    if (success) {
      navigate('/mixes');
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Track</h1>
              <p className="text-gray-600">Update your track information</p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate('/mixes')}
            >
              Cancel
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Track Details</CardTitle>
              <CardDescription>Update your track information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Track Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={trackData.title}
                      onChange={handleChange}
                      placeholder="Enter track title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="artist">Artist</Label>
                    <Input
                      id="artist"
                      name="artist"
                      value={trackData.artist}
                      onChange={handleChange}
                      placeholder="Enter artist name"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="genre">Genre</Label>
                  <Select
                    value={trackData.genre}
                    onValueChange={handleGenreChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a genre" />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre.id} value={genre.name}>
                          {genre.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={trackData.description}
                    onChange={handleChange}
                    placeholder="Enter track description"
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="coverImage">Cover Image URL</Label>
                  <Input
                    id="coverImage"
                    name="coverImage"
                    value={trackData.coverImage}
                    onChange={handleChange}
                    placeholder="Enter cover image URL"
                  />
                  {trackData.coverImage && (
                    <div className="mt-2 w-24 h-24 rounded-md overflow-hidden">
                      <img 
                        src={trackData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end mt-8">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default EditTrack;
