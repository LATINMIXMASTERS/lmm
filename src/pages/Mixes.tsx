
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Upload, PlusCircle } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import GenreTabs from '@/components/GenreTabs';
import { formatDuration } from '@/utils/formatTime';

const Mixes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    tracks, 
    genres, 
    currentPlayingTrack, 
    setCurrentPlayingTrack, 
    likeTrack, 
    addComment,
    shareTrack
  } = useTrack();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trackId = searchParams.get('track');
    if (trackId) {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        setCurrentPlayingTrack(trackId);
        if (track.genre) {
          const genreObj = genres.find(g => g.name === track.genre);
          if (genreObj) {
            setSelectedTabGenre(genreObj.id);
          }
        }
      }
    }
  }, [location.search, tracks, genres, setCurrentPlayingTrack]);
  
  useEffect(() => {
    if (selectedTabGenre === 'all') {
      setFilteredTracks(tracks);
    } else {
      const genre = genres.find(g => g.id === selectedTabGenre);
      if (genre) {
        setFilteredTracks(tracks.filter(track => track.genre === genre.name));
      }
    }
  }, [selectedTabGenre, tracks, genres]);

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

    navigate('/upload-track');
  };

  const handleManageGenres = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to manage genres",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts and admins can manage genres",
        variant: "destructive"
      });
      return;
    }

    navigate('/manage-genres');
  };

  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId === currentPlayingTrack ? null : trackId);
  };

  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeTrack(trackId);
  };

  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments({
      ...newComments,
      [trackId]: value
    });
  };

  const handleSubmitComment = (trackId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to comment",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    const commentText = newComments[trackId];
    if (!commentText?.trim()) return;

    addComment(trackId, {
      userId: user?.id || 'anonymous',
      username: user?.username || 'Anonymous', // Using username instead of displayName
      text: commentText
    });
    
    setNewComments({
      ...newComments,
      [trackId]: ''
    });
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Mixes</h1>
            <p className="text-gray-600 mb-4">Discover tracks uploaded by our DJ crew</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isAuthenticated && (user?.isRadioHost || user?.isAdmin) && (
              <>
                <Button 
                  onClick={handleManageGenres}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  Manage Genres
                </Button>
                
                <Button 
                  onClick={handleUpload}
                  className="bg-blue hover:bg-blue-dark text-white flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Mix
                </Button>
              </>
            )}
          </div>
        </div>
        
        <GenreTabs 
          genres={genres}
          tracks={tracks}
          filteredTracks={filteredTracks}
          selectedTabGenre={selectedTabGenre}
          setSelectedTabGenre={setSelectedTabGenre}
          currentPlayingTrack={currentPlayingTrack}
          handlePlayTrack={handlePlayTrack}
          handleLikeTrack={handleLikeTrack}
          handleShareTrack={handleShareTrack}
          newComments={newComments}
          handleCommentChange={handleCommentChange}
          handleSubmitComment={handleSubmitComment}
          formatDuration={formatDuration}
        />
      </div>
    </MainLayout>
  );
};

export default Mixes;
