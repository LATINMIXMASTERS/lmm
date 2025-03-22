
import React from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Music, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Track } from '@/models/Track';

interface MixesListProps {
  tracks: Track[];
  onEditTrack: (trackId: string) => void;
  onDeleteTrack: (trackId: string) => void;
}

const MixesList: React.FC<MixesListProps> = ({ tracks, onEditTrack, onDeleteTrack }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Your Mixes</CardTitle>
        <Button onClick={() => navigate('/upload')}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Upload New Mix
        </Button>
      </CardHeader>
      <CardContent>
        {tracks.length === 0 ? (
          <div className="text-center py-8">
            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You haven't uploaded any mixes yet</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/upload')}
            >
              Upload Your First Mix
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks.map(track => (
                <TableRow key={track.id}>
                  <TableCell className="font-medium">{track.title}</TableCell>
                  <TableCell>{track.genre}</TableCell>
                  <TableCell>{format(new Date(track.uploadDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{track.plays || track.playCount || 0}</TableCell>
                  <TableCell>{track.likes}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onEditTrack(track.id)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => onDeleteTrack(track.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default MixesList;
