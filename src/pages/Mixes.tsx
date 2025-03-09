
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, Filter } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  coverImage: string;
  audioFile: string;
  likes: number;
  uploadedBy: string;
  uploadDate: string;
}

// Sample tracks data (this would come from your backend in a real app)
const sampleTracks: Track[] = [
  {
    id: '1',
    title: 'Latin Summer Mix 2023',
    artist: 'DJ Carlos',
    genre: 'Reggaeton',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=500&auto=format&fit=crop',
    audioFile: '/sample-audio.mp3',
    likes: 423,
    uploadedBy: 'dj_carlos',
    uploadDate: '2023-06-15'
  },
  {
    id: '2',
    title: 'Bachata Nights',
    artist: 'DJ Maria',
    genre: 'Bachata',
    coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=500&auto=format&fit=crop',
    audioFile: '/sample-audio2.mp3',
    likes: 289,
    uploadedBy: 'dj_maria',
    uploadDate: '2023-07-22'
  },
  {
    id: '3',
    title: 'Salsa Revolution',
    artist: 'DJ Rodriguez',
    genre: 'Salsa',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=500&auto=format&fit=crop',
    audioFile: '/sample-audio3.mp3',
    likes: 156,
    uploadedBy: 'dj_rodriguez',
    uploadDate: '2023-08-11'
  }
];

// Available genres (in a real app, these would come from your backend)
const genres = ['All', 'Reggaeton', 'Bachata', 'Salsa', 'Merengue', 'Latin Pop', 'Latin Trap'];

const Mixes: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>(sampleTracks);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [currentlyPlaying, setCurrentlyPlaying] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Filter tracks by genre
  useEffect(() => {
    if (selectedGenre === 'All') {
      setTracks(sampleTracks);
    } else {
      setTracks(sampleTracks.filter(track => track.genre === selectedGenre));
    }
  }, [selectedGenre]);

  const handleUpload = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload mixes",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts can upload mixes",
        variant: "destructive"
      });
      return;
    }

    // Navigate to upload page (to be implemented)
    toast({
      title: "Upload functionality",
      description: "Upload feature will be implemented soon",
    });
  };

  const handlePlayTrack = (trackId: string) => {
    setCurrentlyPlaying(trackId === currentlyPlaying ? null : trackId);
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mixes</h1>
            <p className="text-gray-600 mb-4">Discover tracks uploaded by our DJ crew</p>
          </div>
          
          {isAuthenticated && user?.isRadioHost && (
            <Button 
              onClick={handleUpload}
              className="bg-blue hover:bg-blue-dark text-white flex items-center gap-2"
            >
              <Music className="w-4 h-4" />
              Upload Mix
            </Button>
          )}
        </div>
        
        {/* Genre filters */}
        <div className="flex flex-wrap gap-2 mb-8">
          {genres.map(genre => (
            <Button 
              key={genre} 
              variant={selectedGenre === genre ? "default" : "outline"}
              onClick={() => setSelectedGenre(genre)}
              className="flex items-center gap-1"
            >
              {selectedGenre === genre && <Filter className="w-3 h-3" />}
              {genre}
            </Button>
          ))}
        </div>
        
        {/* Tracks grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map(track => (
            <Card key={track.id} className="overflow-hidden hover:shadow-md transition-shadow duration-300">
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                <img 
                  src={track.coverImage} 
                  alt={track.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handlePlayTrack(track.id)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300"
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center">
                      {currentlyPlaying === track.id ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg truncate">{track.title}</h3>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{track.genre}</span>
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    Uploaded by <span className="font-medium">{track.uploadedBy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="text-gray-400 hover:text-red-500 transition-colors duration-300">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>
                    <span className="text-sm">{track.likes}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {tracks.length === 0 && (
          <div className="text-center py-16">
            <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-1">No tracks found</h3>
            <p className="text-gray-500">No tracks available for this genre yet</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Mixes;
