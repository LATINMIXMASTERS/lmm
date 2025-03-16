
import React from 'react';
import { formatDuration } from '@/utils/formatTime';
import MainLayout from '@/layout/MainLayout';
import { useTrack } from '@/hooks/useTrackContext';
import GenreTabs from '@/components/GenreTabs';
import MixesHeader from '@/components/mixes/MixesHeader';
import TrackActions from '@/components/mixes/TrackActions';
import { useTrackInteractions } from '@/components/mixes/useTrackInteractions';
import { useTrackFilters } from '@/components/mixes/useTrackFilters';
import { Track } from '@/models/Track';

/**
 * Mixes page component that displays all uploaded tracks organized by genre tabs.
 * This component orchestrates the filtering, display, and interactions with tracks.
 */
const Mixes: React.FC = () => {
  // Get track data and related state from context
  const { tracks, genres, currentPlayingTrack, setCurrentPlayingTrack } = useTrack();
  
  // Custom hooks for track interactions (play, like, comment, etc.) and filtering
  const {
    isAuthenticated,
    user,
    newComments,
    handleUpload,
    handleManageGenres,
    handlePlayTrack,
    handleLikeTrack,
    handleShareTrack,
    handleEditTrack,
    handleDeleteTrack,
    handleCommentChange,
    handleSubmitComment,
    canUserEditTrack
  } = useTrackInteractions();
  
  // Track filtering hook for genre selection and filtering
  const {
    selectedGenre,
    filteredTracks,
    selectedTabGenre,
    setSelectedTabGenre
  } = useTrackFilters(tracks, genres, setCurrentPlayingTrack);

  /**
   * Conditionally renders track action buttons (edit, delete) 
   * based on user permissions for a specific track
   * @param track - The track to check permissions for
   * @returns React component with track actions or null
   */
  const renderTrackActionsComponent = (track: Track) => {
    if (!canUserEditTrack(track.id)) return null;
    
    return (
      <TrackActions 
        track={track} 
        onEdit={handleEditTrack} 
        onDelete={handleDeleteTrack}
      />
    );
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Header with title and upload buttons */}
        <MixesHeader 
          isAuthenticated={isAuthenticated}
          user={user}
          handleManageGenres={handleManageGenres}
          handleUpload={handleUpload}
        />
        
        {/* Genre tabs with track listing */}
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
          renderTrackActions={renderTrackActionsComponent}
        />
      </div>
    </MainLayout>
  );
};

export default Mixes;
