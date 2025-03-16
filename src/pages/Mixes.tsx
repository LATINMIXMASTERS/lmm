
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

const Mixes: React.FC = () => {
  const { tracks, genres, currentPlayingTrack, setCurrentPlayingTrack } = useTrack();
  
  // Custom hooks for track interactions and filtering
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
    renderTrackActions
  } = useTrackInteractions();
  
  const {
    selectedGenre,
    filteredTracks,
    selectedTabGenre,
    setSelectedTabGenre
  } = useTrackFilters(tracks, genres, setCurrentPlayingTrack);

  // Render track actions (edit, delete buttons)
  const renderTrackActionsComponent = (track: Track) => {
    if (!renderTrackActions(track.id)) return null;
    
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
        <MixesHeader 
          isAuthenticated={isAuthenticated}
          user={user}
          handleManageGenres={handleManageGenres}
          handleUpload={handleUpload}
        />
        
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
