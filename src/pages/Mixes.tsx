
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Upload, PlusCircle, Edit, Trash2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import GenreTabs from '@/components/GenreTabs';
import { formatDuration } from '@/utils/formatTime';
import { Track } from '@/models/Track';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Mixes: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    tracks, 
    genres, 
    currentPlayingTrack, 
    setCurrentPlayingTrack, 
    likeTrack, 
    addComment,
    shareTrack,
    deleteTrack,
    canEditTrack
  } = useTrack();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  const [trackToDelete, setTrackToDelete] = useState<string | null>(null);
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const genre = searchParams.get('genre');
    
    if (genre) {
      // Set selected tab to the genre from the URL parameter
      setSelectedTabGenre(genre);
    } else {
      // Check if there's a track in URL
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

  const handleEditTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-track/${trackId}`);
  };

  const confirmDeleteTrack = () => {
    if (!trackToDelete) return;
    
    deleteTrack(trackToDelete);
    setTrackToDelete(null);
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
      username: user?.username || 'Anonymous',
      text: commentText
    });
    
    setNewComments({
      ...newComments,
      [trackId]: ''
    });
  };

  const renderTrackActions = (track: Track) => {
    const isEditable = canEditTrack(track.id);
    
    if (!isEditable) return null;
    
    return (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => handleEditTrack(track.id, e)}
          title="Edit track"
        >
          <Edit className="h-4 w-4" />
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
              title="Delete track"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this track.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteTrack(track.id)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  };

  // Filter tracks based on selected genre tab
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
          renderTrackActions={renderTrackActions}
        />
      </div>
    </MainLayout>
  );
};

export default Mixes;
