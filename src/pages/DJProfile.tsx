
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit, Trash2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/models/Track';
import UserNotFound from '@/components/profile/UserNotFound';
import DeleteTrackDialog from '@/components/profile/DeleteTrackDialog';
import DJProfileHeader from '@/components/profile/DJProfileHeader';
import DJProfileActions from '@/components/profile/DJProfileActions';
import DJProfileTabs from '@/components/profile/DJProfileTabs';

const DJProfile: React.FC = () => {
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
  
  const djUser = users.find(u => u.id === userId && u.isRadioHost);
  
  const userTracks = djUser ? getTracksByUser(djUser.id) : [];
  const filteredTracks = userTracks.filter(track => 
    selectedTabGenre === 'all' || track.genre === selectedTabGenre
  );
  
  const djStations = stations.filter(station => 
    station.hosts && station.hosts.includes(djUser?.id || '')
  );
  
  const djBookings = bookings.filter(booking => 
    booking.hostId === djUser?.id
  );
  
  if (!djUser || !djUser.isRadioHost) {
    return (
      <MainLayout>
        <UserNotFound />
      </MainLayout>
    );
  }
  
  const handleShareProfile = () => {
    const usernameSlug = djUser.username.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const shareUrl = `${window.location.origin}/dj/${usernameSlug}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${djUser.username}'s DJ Profile - Latin Mix Masters`,
        text: `Check out ${djUser.username}, a DJ on Latin Mix Masters!`,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        copyProfileLink(shareUrl);
      });
    } else {
      copyProfileLink(shareUrl);
    }
  };
  
  const copyProfileLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: `${djUser.username}'s profile link copied to clipboard`,
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
        <div className="flex justify-between items-start mb-6">
          <DJProfileHeader 
            hostUser={djUser} 
            onEditProfile={user?.id === djUser.id ? () => navigate('/dj-dashboard') : undefined}
          />
          
          <DJProfileActions 
            djUser={djUser}
            onShareProfile={handleShareProfile}
          />
        </div>
        
        <div className="max-w-5xl mx-auto">
          <DJProfileTabs 
            djUser={djUser}
            userTracks={userTracks}
            filteredTracks={filteredTracks}
            selectedTabGenre={selectedTabGenre}
            setSelectedTabGenre={setSelectedTabGenre}
            currentPlayingTrack={currentPlayingTrack}
            genres={genres}
            user={user}
            djStations={djStations}
            djBookings={djBookings}
            handlePlayTrack={handlePlayTrack}
            handleLikeTrack={handleLikeTrack}
            handleShareTrack={handleShareTrack}
            newComments={newComments}
            handleCommentChange={handleCommentChange}
            handleSubmitComment={handleSubmitComment}
            formatDuration={formatDuration}
            renderTrackActions={renderTrackActions}
            startListening={startListening}
          />
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

export default DJProfile;
