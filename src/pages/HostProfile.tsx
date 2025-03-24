
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Music, Edit, Trash2, Share2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import GenreTabs from '@/components/GenreTabs';
import { Track } from '@/models/Track';
import UserNotFound from '@/components/profile/UserNotFound';
import HostProfileHeader from '@/components/profile/HostProfileHeader';
import DeleteTrackDialog from '@/components/profile/DeleteTrackDialog';
import RadioShowsTab from '@/components/profile/RadioShowsTab';
import { Card, CardContent } from '@/components/ui/card';

const HostProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, users } = useAuth();
  const { tracks, genres, getTracksByUser, deleteTrack, likeTrack, addComment, shareTrack } = useTrack();
  const { stations, bookings, setCurrentPlayingStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});
  
  const hostUser = users.find(u => u.id === userId && u.isRadioHost);
  
  const userTracks = hostUser ? getTracksByUser(hostUser.id) : [];
  const filteredTracks = userTracks.filter(track => 
    selectedTabGenre === 'all' || track.genre === selectedTabGenre
  );
  
  const hostStations = stations.filter(station => 
    station.hosts && station.hosts.includes(hostUser?.id || '')
  );
  
  const hostBookings = bookings.filter(booking => 
    booking.hostId === hostUser?.id
  );
  
  if (!hostUser || !hostUser.isRadioHost) {
    return (
      <MainLayout>
        <UserNotFound />
      </MainLayout>
    );
  }
  
  // Handle profile sharing
  const handleShareProfile = () => {
    const shareUrl = `${window.location.origin}/host/${hostUser.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${hostUser.username}'s DJ Profile - Latin Mix Masters`,
        text: `Check out ${hostUser.username}, a DJ on Latin Mix Masters!`,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        copyProfileLink(shareUrl);
      });
    } else {
      copyProfileLink(shareUrl);
    }
  };
  
  // Copy profile link to clipboard
  const copyProfileLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: `${hostUser.username}'s profile link copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the profile link to clipboard",
        variant: "destructive"
      });
    });
  };
  
  const startListening = (stationId: string) => {
    setCurrentPlayingStation(stationId);
    toast({
      title: "Now Playing",
      description: `Started playing radio station`
    });
  };

  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId);
  };

  const handleEditTrack = (trackId: string) => {
    navigate(`/edit-track/${trackId}`);
  };

  const handleDeleteTrack = (track: Track) => {
    setTrackToDelete(track);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTrack = () => {
    if (trackToDelete) {
      const success = deleteTrack(trackToDelete.id);
      if (success) {
        toast({
          title: "Track deleted",
          description: "The track has been removed",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setTrackToDelete(null);
  };
  
  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    likeTrack(trackId);
    toast({
      title: "Track liked",
      description: "This track has been added to your favorites",
    });
  };

  const handleShareTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    shareTrack(trackId);
  };

  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [trackId]: value
    }));
  };

  const handleSubmitComment = (trackId: string, e: React.FormEvent) => {
    e.preventDefault();
    const comment = newComments[trackId];
    if (!comment?.trim()) return;
    
    addComment(trackId, {
      userId: user?.id || 'anonymous',
      username: user?.username || 'Guest',
      text: comment
    });
    
    setNewComments(prev => ({
      ...prev,
      [trackId]: ''
    }));
    
    toast({
      title: "Comment added",
      description: "Your comment has been posted",
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Can manage track - admins can manage ANY track
  const canManageTrack = (track: Track) => {
    if (!user) return false;
    return user.isAdmin || track.uploadedBy === user.id;
  };

  const renderTrackActions = (track: Track) => {
    if (!canManageTrack(track)) return null;
    
    return (
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleEditTrack(track.id)}
          className="h-8 w-8 text-blue"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDeleteTrack(track)}
          className="h-8 w-8 text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Profile Header with Share Button */}
        <div className="flex justify-between items-start mb-6">
          <HostProfileHeader 
            hostUser={hostUser} 
            onEditProfile={user?.id === hostUser.id ? () => navigate('/host-dashboard') : undefined}
          />
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleShareProfile}
            className="flex items-center gap-1"
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </Button>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <Tabs defaultValue="mixes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mixes">Mixes</TabsTrigger>
              <TabsTrigger value="shows">Radio Shows</TabsTrigger>
            </TabsList>
            
            <TabsContent value="mixes">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{hostUser.username}'s Mixes</h2>
                {user && (user.id === hostUser.id || user.isAdmin) && (
                  <Button onClick={() => navigate('/upload-track')}>
                    Upload New Mix
                  </Button>
                )}
              </div>
              
              {userTracks.length > 0 ? (
                <GenreTabs
                  genres={genres}
                  tracks={userTracks}
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
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Music className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">This DJ hasn't uploaded any mixes yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="shows">
              <RadioShowsTab 
                hostStations={hostStations} 
                hostBookings={hostBookings}
                startListening={startListening} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <DeleteTrackDialog
        isOpen={isDeleteDialogOpen}
        setIsOpen={setIsDeleteDialogOpen}
        trackToDelete={trackToDelete}
        onConfirmDelete={confirmDeleteTrack}
      />
    </MainLayout>
  );
};

export default HostProfile;
