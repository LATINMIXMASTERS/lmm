
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Music, Filter, Upload, PlusCircle, Play, Pause, Heart, MessageCircle, Share2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
  
  // Parse URL query params on initial load
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const trackId = searchParams.get('track');
    if (trackId) {
      const track = tracks.find(t => t.id === trackId);
      if (track) {
        setCurrentPlayingTrack(trackId);
        // If the track has a genre, select that genre
        if (track.genre) {
          const genreObj = genres.find(g => g.name === track.genre);
          if (genreObj) {
            setSelectedTabGenre(genreObj.id);
          }
        }
      }
    }
  }, [location.search, tracks, genres, setCurrentPlayingTrack]);
  
  // Filter tracks by genre
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

    // Navigate to upload page
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

    // Navigate to genres page
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
      username: user?.name || 'Anonymous',
      text: commentText
    });
    
    // Clear the comment input
    setNewComments({
      ...newComments,
      [trackId]: ''
    });
  };

  // Function to format duration from seconds to MM:SS
  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        
        {/* Genre tabs */}
        <Tabs 
          defaultValue="all" 
          value={selectedTabGenre}
          onValueChange={setSelectedTabGenre}
          className="w-full mb-8"
        >
          <TabsList className="w-full overflow-x-auto flex flex-nowrap mb-4 p-1 bg-gray-100 rounded-lg">
            <TabsTrigger value="all" className="flex-shrink-0">
              All Genres
            </TabsTrigger>
            {genres.map(genre => (
              <TabsTrigger 
                key={genre.id} 
                value={genre.id}
                className="flex-shrink-0"
              >
                {genre.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tracks.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-1">No tracks found</h3>
                  <p className="text-gray-500">No tracks have been uploaded yet</p>
                </div>
              ) : (
                tracks.map(track => (
                  <TrackCard
                    key={track.id}
                    track={track}
                    isPlaying={currentPlayingTrack === track.id}
                    onPlay={() => handlePlayTrack(track.id)}
                    onLike={(e) => handleLikeTrack(track.id, e)}
                    onShare={(e) => handleShareTrack(track.id, e)}
                    newComment={newComments[track.id] || ''}
                    onCommentChange={(value) => handleCommentChange(track.id, value)}
                    onSubmitComment={(e) => handleSubmitComment(track.id, e)}
                    formatDuration={formatDuration}
                  />
                ))
              )}
            </div>
          </TabsContent>
          
          {genres.map(genre => (
            <TabsContent key={genre.id} value={genre.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTracks.length === 0 ? (
                  <div className="col-span-full text-center py-16">
                    <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-1">No tracks found</h3>
                    <p className="text-gray-500">No tracks available for {genre.name} yet</p>
                  </div>
                ) : (
                  filteredTracks.map(track => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      isPlaying={currentPlayingTrack === track.id}
                      onPlay={() => handlePlayTrack(track.id)}
                      onLike={(e) => handleLikeTrack(track.id, e)}
                      onShare={(e) => handleShareTrack(track.id, e)}
                      newComment={newComments[track.id] || ''}
                      onCommentChange={(value) => handleCommentChange(track.id, value)}
                      onSubmitComment={(e) => handleSubmitComment(track.id, e)}
                      formatDuration={formatDuration}
                    />
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </MainLayout>
  );
};

// Track Card Component
interface TrackCardProps {
  track: any;
  isPlaying: boolean;
  onPlay: () => void;
  onLike: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  newComment: string;
  onCommentChange: (value: string) => void;
  onSubmitComment: (e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  onPlay,
  onLike,
  onShare,
  newComment,
  onCommentChange,
  onSubmitComment,
  formatDuration
}) => {
  const [showComments, setShowComments] = useState(false);
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={track.coverImage} 
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={onPlay}
          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300"
        >
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-blue flex items-center justify-center">
              {isPlaying ? (
                <Pause className="w-6 h-6 text-white" />
              ) : (
                <Play className="w-6 h-6 text-white ml-1" />
              )}
            </div>
          </div>
        </button>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-lg truncate">{track.title}</h3>
            <p className="text-sm text-gray-600">{track.artist}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">{track.genre}</span>
        </div>
        
        {/* Waveform visualization */}
        <div className="flex h-12 items-end space-x-0.5 mb-3">
          {track.waveformData?.map((height: number, i: number) => (
            <div 
              key={i}
              className={cn(
                "flex-1 rounded-sm", 
                isPlaying ? "bg-blue" : "bg-gray-300"
              )}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mb-4">
          <span>{formatDuration(track.duration)}</span>
          <span>{format(new Date(track.uploadDate), 'MMM d, yyyy')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={onLike}
              className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors"
            >
              <Heart className="w-4 h-4" />
              <span>{track.likes}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className={cn(
                "flex items-center gap-1 transition-colors",
                showComments ? "text-blue-500" : "text-gray-500 hover:text-blue-500"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              <span>{track.comments?.length || 0}</span>
            </button>
            
            <button 
              onClick={onShare}
              className="text-gray-500 hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <form onSubmit={onSubmitComment} className="flex gap-2 mb-3">
              <input 
                type="text"
                placeholder="Add a comment..."
                className="flex-1 text-sm px-3 py-1.5 border border-gray-200 rounded-md"
                value={newComment}
                onChange={(e) => onCommentChange(e.target.value)}
              />
              <Button type="submit" size="sm" variant="secondary">Post</Button>
            </form>
            
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {track.comments?.map((comment: any) => (
                <div key={comment.id} className="flex gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-xs">
                    {comment.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{comment.username}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.date), 'MMM d, h:mma')}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
              
              {(!track.comments || track.comments.length === 0) && (
                <p className="text-sm text-gray-500 text-center py-2">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Mixes;
