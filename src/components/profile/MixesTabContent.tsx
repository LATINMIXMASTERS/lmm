
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Music } from 'lucide-react';
import { Track } from '@/models/Track';
import { User } from '@/contexts/auth/types';
import GenreTabs from '@/components/GenreTabs';
import { useNavigate } from 'react-router-dom';

interface MixesTabContentProps {
  djUser: User;
  userTracks: Track[];
  filteredTracks: Track[];
  selectedTabGenre: string;
  setSelectedTabGenre: (genre: string) => void;
  currentPlayingTrack: string | null;
  genres: string[];  // Updated to accept string[] instead of Genre[]
  user: User | null;
  handlePlayTrack: (trackId: string) => void;
  handleLikeTrack: (trackId: string, e: React.MouseEvent) => void;
  handleShareTrack: (trackId: string, e: React.MouseEvent) => void;
  newComments: Record<string, string>;
  handleCommentChange: (trackId: string, value: string) => void;
  handleSubmitComment: (trackId: string, e: React.FormEvent) => void;
  formatDuration: (seconds?: number) => string;
  renderTrackActions: (track: Track) => React.ReactNode | null;
}

const MixesTabContent: React.FC<MixesTabContentProps> = ({
  djUser,
  userTracks,
  filteredTracks,
  selectedTabGenre,
  setSelectedTabGenre,
  currentPlayingTrack,
  genres,
  user,
  handlePlayTrack,
  handleLikeTrack,
  handleShareTrack,
  newComments,
  handleCommentChange,
  handleSubmitComment,
  formatDuration,
  renderTrackActions
}) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{djUser.username}'s Mixes</h2>
        {user && (user.id === djUser.id || user.isAdmin) && (
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
    </>
  );
};

export default MixesTabContent;
