
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
  const { users } = useAuth();
  const { genres } = useTrack();
  
  // Get list of approved hosts
  const hostUsers = users.filter(u => u.isRadioHost && u.approved);
  
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
