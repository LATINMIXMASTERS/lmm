
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioStation, BookingSlot } from '@/models/RadioStation';
import { Track, Genre } from '@/models/Track';
import { User } from '@/contexts/auth/types';
import MixesTabContent from './MixesTabContent';
import RadioShowsTab from './RadioShowsTab';

interface DJProfileTabsProps {
  djUser: User;
  userTracks: Track[];
  filteredTracks: Track[];
  selectedTabGenre: string;
  setSelectedTabGenre: (genre: string) => void;
  currentPlayingTrack: string | null;
  genres: Genre[];
  user: User | null;
  djStations: RadioStation[];
  djBookings: BookingSlot[];
  handlePlayTrack: (trackId: string) => void;
  handleLikeTrack: (trackId: string, e: React.MouseEvent) => void;
  handleShareTrack: (trackId: string, e: React.MouseEvent) => void;
  newComments: Record<string, string>;
  handleCommentChange: (trackId: string, value: string) => void;
  handleSubmitComment: (trackId: string, e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
  renderTrackActions: (track: Track) => React.ReactNode | null;
  startListening: (stationId: string) => void;
}

const DJProfileTabs: React.FC<DJProfileTabsProps> = ({
  djUser,
  userTracks,
  filteredTracks,
  selectedTabGenre,
  setSelectedTabGenre,
  currentPlayingTrack,
  genres,
  user,
  djStations,
  djBookings,
  handlePlayTrack,
  handleLikeTrack,
  handleShareTrack,
  newComments,
  handleCommentChange,
  handleSubmitComment,
  formatDuration,
  renderTrackActions,
  startListening
}) => {
  // Convert Genre objects to strings for MixesTabContent
  const genreNames = genres.map(genre => genre.name);
  
  return (
    <Tabs defaultValue="mixes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="mixes">Mixes</TabsTrigger>
        <TabsTrigger value="shows">Radio Shows</TabsTrigger>
      </TabsList>
      
      <TabsContent value="mixes">
        <MixesTabContent
          djUser={djUser}
          userTracks={userTracks}
          filteredTracks={filteredTracks}
          selectedTabGenre={selectedTabGenre}
          setSelectedTabGenre={setSelectedTabGenre}
          currentPlayingTrack={currentPlayingTrack}
          genres={genreNames}
          user={user}
          handlePlayTrack={handlePlayTrack}
          handleLikeTrack={handleLikeTrack}
          handleShareTrack={handleShareTrack}
          newComments={newComments}
          handleCommentChange={handleCommentChange}
          handleSubmitComment={handleSubmitComment}
          formatDuration={formatDuration}
          renderTrackActions={renderTrackActions}
        />
      </TabsContent>
      
      <TabsContent value="shows">
        <RadioShowsTab 
          hostStations={djStations} 
          hostBookings={djBookings}
          startListening={startListening} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default DJProfileTabs;
