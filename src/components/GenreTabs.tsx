
import React from 'react';
import { Music } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Track } from '@/models/Track';
import TrackCard from './TrackCard';

/**
 * Props for the GenreTabs component
 */
interface GenreTabsProps {
  genres: string[];  // Updated to accept string[] instead of Genre[]
  tracks: Track[];
  filteredTracks: Track[];
  selectedTabGenre: string;
  setSelectedTabGenre: (value: string) => void;
  currentPlayingTrack: string | null;
  handlePlayTrack: (trackId: string) => void;
  handleLikeTrack: (trackId: string, e: React.MouseEvent) => void;
  handleShareTrack: (trackId: string, e: React.MouseEvent) => void;
  newComments: Record<string, string>;
  handleCommentChange: (trackId: string, value: string) => void;
  handleSubmitComment: (trackId: string, e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
  renderTrackActions?: (track: Track) => React.ReactNode;
}

/**
 * Component that displays tracks organized into tabs by genre
 * Each tab shows a grid of tracks filtered by the selected genre
 */
const GenreTabs: React.FC<GenreTabsProps> = ({
  genres,
  tracks,
  filteredTracks,
  selectedTabGenre,
  setSelectedTabGenre,
  currentPlayingTrack,
  handlePlayTrack,
  handleLikeTrack,
  handleShareTrack,
  newComments,
  handleCommentChange,
  handleSubmitComment,
  formatDuration,
  renderTrackActions
}) => {
  return (
    <Tabs 
      defaultValue="all" 
      value={selectedTabGenre}
      onValueChange={setSelectedTabGenre}
      className="w-full mb-8"
    >
      {/* Horizontal scrollable tabs for genre selection */}
      <TabsList className="w-full overflow-x-auto flex flex-nowrap mb-4 p-1 bg-gray-100 rounded-lg">
        <TabsTrigger value="all" className="flex-shrink-0">
          All Genres
        </TabsTrigger>
        {genres.map((genre, index) => (
          <TabsTrigger 
            key={index} 
            value={genre}
            className="flex-shrink-0"
          >
            {genre}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {/* "All Genres" tab content */}
      <TabsContent value="all" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.length === 0 ? (
            /* Empty state when no tracks exist */
            <div className="col-span-full text-center py-16">
              <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-1">No tracks found</h3>
              <p className="text-gray-500">No tracks have been uploaded yet</p>
            </div>
          ) : (
            /* Grid of track cards */
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
                renderTrackActions={renderTrackActions}
              />
            ))
          )}
        </div>
      </TabsContent>
      
      {/* Individual genre tabs */}
      {genres.map((genre, index) => (
        <TabsContent key={index} value={genre} className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTracks.length === 0 ? (
              /* Empty state when no tracks exist for this genre */
              <div className="col-span-full text-center py-16">
                <Music className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No tracks found</h3>
                <p className="text-gray-500">No tracks available for {genre} yet</p>
              </div>
            ) : (
              /* Grid of track cards filtered by genre */
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
                  renderTrackActions={renderTrackActions}
                />
              ))
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default GenreTabs;
