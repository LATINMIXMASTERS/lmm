
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Track } from '@/models/Track';
import UserNotFound from '@/components/profile/UserNotFound';
import DeleteTrackDialog from '@/components/profile/DeleteTrackDialog';
import DJProfileHeader from '@/components/profile/DJProfileHeader';
import DJProfileActions from '@/components/profile/DJProfileActions';
import DJProfileTabs from '@/components/profile/DJProfileTabs';
import DJTrackActions from '@/components/profile/DJTrackActions';
import { useDJProfileActions } from '@/hooks/useDJProfileActions';
import { formatDuration, createTrackActionsRenderer } from '@/utils/djProfileUtils';
import useBroadcastSync from '@/hooks/useBroadcastSync'; // Import our new hook

const DJProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user, users } = useAuth();
  const { tracks, genres, getTracksByUser, deleteTrack } = useTrack();
  const { stations, bookings, setCurrentPlayingStation, syncStationsFromStorage } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { performFullSync } = useBroadcastSync(); // Use our new hook

  // Force sync when loading the DJ profile to ensure we have the latest data
  useEffect(() => {
    // Immediate sync
    if (syncStationsFromStorage) {
      syncStationsFromStorage();
    }
    
    // Then use our broadcast sync
    performFullSync();
  }, [username, syncStationsFromStorage, performFullSync]);

  // Find DJ by username or by ID for backwards compatibility
  // Use strict normalization rules to ensure consistent matching
  const normalizedUsername = username?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  
  const djUser = users.find(u => {
    const normalizedUserUsername = u.username.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    // Either direct match on normalized username or direct ID match
    return (normalizedUserUsername === normalizedUsername || u.id === username) && u.isRadioHost;
  });
  
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  
  if (!djUser || !djUser.isRadioHost) {
    return (
      <MainLayout>
        <UserNotFound />
      </MainLayout>
    );
  }
  
  const { 
    handleTrackOperations,
    trackInteractions,
    userTracks,
    filteredTracks,
    djStations,
    djBookings
  } = useDJProfileActions({
    djUser,
    tracks,
    getTracksByUser,
    selectedTabGenre,
    stations,
    bookings
  });
  
  const {
    handlePlayTrack,
    handleLikeTrack,
    handleShareTrack,
    handleCommentChange,
    handleSubmitComment,
    newComments
  } = trackInteractions;
  
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
  
  const startListening = (stationId: string) => {
    setCurrentPlayingStation(stationId);
    toast({
      title: "Now Playing",
      description: `Started playing radio station`
    });
  };
  
  // Create a renderer function for track actions
  const renderTrackActions = (track: Track) => {
    const actionProps = createTrackActionsRenderer(
      user, 
      handleTrackOperations.handleEditTrack,
      handleDeleteTrack
    )(track);
    
    if (!actionProps) return null;
    
    return (
      <DJTrackActions 
        track={actionProps.track}
        onEdit={actionProps.onEdit}
        onDelete={actionProps.onDelete}
      />
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
          
          <DJProfileActions djUser={djUser} />
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
