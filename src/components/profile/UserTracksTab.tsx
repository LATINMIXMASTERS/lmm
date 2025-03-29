
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTrackContext } from '@/hooks/useTrackContext';
import { User } from '@/contexts/auth/types';
import { Track, Comment } from '@/models/Track';
import { formatDistance } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Edit, Music } from 'lucide-react';

interface UserTracksTabProps {
  userId: string;
  isRadioHost?: boolean;
  userTracks?: Track[];
  isAuthenticated?: boolean;
  likeTrack?: (trackId: string) => void;
  addComment?: (trackId: string, comment: Omit<Comment, "id" | "date">) => void;
  showToast?: (title: string, description: string, variant?: 'default' | 'destructive') => void;
  user?: User | null;
  handleEditTrack?: (trackId: string) => void;
  handleDeleteTrack?: (track: Track) => void;
  canUserEditTrack?: (trackId: string) => boolean;
}

const UserTracksTab: React.FC<UserTracksTabProps> = ({ 
  userId,
  isRadioHost,
  userTracks: providedTracks,
  isAuthenticated,
  likeTrack,
  addComment,
  showToast,
  user,
  handleEditTrack,
  handleDeleteTrack,
  canUserEditTrack
}) => {
  const { users } = useAuth();
  const { tracks } = useTrackContext();

  const profileUser = users.find(u => u.id === userId);
  const userTracks = providedTracks || tracks.filter(track => track.artistId === userId);

  if (!profileUser) {
    return <p>User not found.</p>;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{profileUser.username}'s Mixes</CardTitle>
        <CardDescription>
          Uploaded mixes by {profileUser.username}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {userTracks.length > 0 ? (
          <div className="space-y-4">
            {userTracks.map((track) => (
              <div key={track.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{track.title}</h3>
                    <p className="text-sm text-gray-600">
                      Genre: {track.genre}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Uploaded {formatDistance(new Date(track.uploadDate || Date.now()), new Date(), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {(canUserEditTrack && canUserEditTrack(track.id)) && (
                      <Link to={`/edit-track/${track.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-500 border-blue-200 hover:bg-blue-50"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Music className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>{profileUser.username} has not uploaded any mixes yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserTracksTab;
