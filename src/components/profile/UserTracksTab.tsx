
import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Track } from '@/models/Track';
import { User } from '@/contexts/AuthContext';

interface UserTracksTabProps {
  isRadioHost: boolean;
  userTracks: Track[];
  isAuthenticated: boolean;
  likeTrack: (trackId: string) => void;
  addComment: (trackId: string, comment: { userId: string; username: string; text: string }) => void;
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void;
  user: User | null;
  handleEditTrack: (trackId: string, e: React.MouseEvent) => void;
  handleDeleteTrack: (trackId: string) => void;
  canUserEditTrack: (trackId: string) => boolean;
}

const UserTracksTab: React.FC<UserTracksTabProps> = ({
  isRadioHost,
  userTracks,
  isAuthenticated,
  likeTrack,
  addComment,
  showToast,
  user,
  handleEditTrack,
  handleDeleteTrack,
  canUserEditTrack
}) => {
  const [currentPlayingTrack, setCurrentPlayingTrack] = useState<string | null>(null);
  const [newComments, setNewComments] = useState<Record<string, string>>({});

  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId);
  };

  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      likeTrack(trackId);
      showToast('Track liked', 'This track has been added to your favorites');
    } else {
      showToast('Authentication required', 'Please log in to like tracks', 'destructive');
    }
  };

  const handleCommentChange = (trackId: string, value: string) => {
    setNewComments(prev => ({
      ...prev,
      [trackId]: value
    }));
  };

  const handleSubmitComment = (trackId: string, e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      showToast('Authentication required', 'Please log in to comment', 'destructive');
      return;
    }
    
    const comment = newComments[trackId];
    if (!comment?.trim()) return;
    
    addComment(trackId, {
      userId: user?.id || 'anonymous',
      username: user?.username || 'Guest',
      text: comment
    });
    
    setNewComments(prev => ({
      ...prev,
      [trackId]: ''
    }));
    
    showToast('Comment added', 'Your comment has been posted');
  };

  if (userTracks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Music className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {isRadioHost ? "This DJ hasn't uploaded any mixes yet." : "This user hasn't uploaded any tracks yet."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {userTracks.map(track => (
        <Card key={track.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{track.title}</h3>
                <p className="text-sm text-muted-foreground">{track.genre}</p>
              </div>
              
              {/* Track Actions */}
              <div className="flex space-x-2">
                {canUserEditTrack(track.id) && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={(e) => handleEditTrack(track.id, e)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDeleteTrack(track.id)}
                    >
                      Delete
                    </Button>
                  </>
                )}
                
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handlePlayTrack(track.id)}
                >
                  {currentPlayingTrack === track.id ? 'Pause' : 'Play'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleLikeTrack(track.id, e)}
                >
                  Like ({track.likes})
                </Button>
              </div>
            </div>
            
            {/* Comment Form */}
            <div className="mt-4">
              <form onSubmit={(e) => handleSubmitComment(track.id, e)}>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border rounded px-3 py-1"
                    placeholder="Add a comment..."
                    value={newComments[track.id] || ''}
                    onChange={(e) => handleCommentChange(track.id, e.target.value)}
                  />
                  <Button type="submit" size="sm">Comment</Button>
                </div>
              </form>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserTracksTab;
