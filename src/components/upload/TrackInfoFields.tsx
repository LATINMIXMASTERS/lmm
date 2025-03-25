
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrackInfoFieldsProps {
  title: string;
  setTitle: (title: string) => void;
  selectedArtistId: string;
  setSelectedArtistId: (artistId: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
}

const TrackInfoFields: React.FC<TrackInfoFieldsProps> = ({
  title,
  setTitle,
  selectedArtistId,
  setSelectedArtistId,
  selectedGenre,
  setSelectedGenre
}) => {
  const { users, user, isAuthenticated } = useAuth();
  const { genres } = useTrack();
  
  // Get list of approved hosts
  // If user is admin, they can see all hosts, otherwise just their own profile
  const hostUsers = user?.isAdmin 
    ? users.filter(u => u.isRadioHost && u.approved)
    : users.filter(u => u.id === user?.id && u.isRadioHost && u.approved);
  
  // If the user is authenticated but not yet selected an artist, auto-select themselves
  React.useEffect(() => {
    if (isAuthenticated && user && !selectedArtistId) {
      setSelectedArtistId(user.id);
    }
  }, [isAuthenticated, user, selectedArtistId, setSelectedArtistId]);
  
  return (
    <>
      {/* Track title */}
      <div className="space-y-2">
        <Label htmlFor="title">Mix Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the title of your mix"
          required
        />
      </div>
      
      {/* Artist selection dropdown */}
      <div className="space-y-2">
        <Label htmlFor="artist">DJ Name</Label>
        <Select
          value={selectedArtistId}
          onValueChange={setSelectedArtistId}
          disabled={!user?.isAdmin && hostUsers.length === 1}
        >
          <SelectTrigger id="artist">
            <SelectValue placeholder="Select a DJ" />
          </SelectTrigger>
          <SelectContent>
            {hostUsers.map((hostUser) => (
              <SelectItem key={hostUser.id} value={hostUser.id}>
                {hostUser.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!user?.isAdmin && (
          <p className="text-xs text-muted-foreground mt-1">
            You can only upload tracks to your own profile
          </p>
        )}
      </div>
      
      {/* Genre selection */}
      <div className="space-y-2">
        <Label htmlFor="genre">Genre</Label>
        <Select
          value={selectedGenre}
          onValueChange={setSelectedGenre}
        >
          <SelectTrigger id="genre">
            <SelectValue placeholder="Select a genre" />
          </SelectTrigger>
          <SelectContent>
            {genres.map((genre) => (
              <SelectItem key={genre.id} value={genre.name}>
                {genre.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default TrackInfoFields;
