
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Track, Comment } from '@/models/Track';

interface UserTracksTabProps {
  isRadioHost: boolean;
  userTracks: Track[];
  isAuthenticated: boolean;
  likeTrack: (id: string) => void;
  addComment: (trackId: string, comment: Omit<Comment, 'id' | 'date'>) => void;
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void;
  user: { id: string; username: string } | null;
}

const UserTracksTab: React.FC<UserTracksTabProps> = ({ 
  isRadioHost, 
  userTracks, 
  isAuthenticated, 
  likeTrack, 
  addComment, 
  showToast,
  user
}) => {
  const navigate = useNavigate();
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  const handleLikeTrack = (trackId: string) => {
    if (!isAuthenticated) {
      showToast(
        "Authentication Required",
        "You need to be logged in to like tracks",
        "destructive"
      );
      return;
    }
    
    likeTrack(trackId);
    showToast("Track Liked", "You've liked this track");
  };
  
  const handleAddComment = (trackId: string) => {
    if (!user || !newComment.trim()) return;
    
    addComment(trackId, {
      userId: user.id,
      username: user.username,
      text: newComment.trim()
    });
    
    setNewComment('');
    setActiveTrackId(null);
    
    showToast("Comment Added", "Your comment has been added to this track");
  };

  if (!isRadioHost) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">This user is not a registered DJ and cannot upload tracks.</p>
        </CardContent>
      </Card>
    );
  }

  if (userTracks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">This DJ hasn't uploaded any tracks yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {userTracks.map(track => (
        <Card key={track.id} className="overflow-hidden">
          <div className="aspect-video relative">
            <img 
              src={track.coverImage} 
              alt={track.title} 
              className="object-cover w-full h-full"
            />
          </div>
          <CardHeader>
            <CardTitle>{track.title}</CardTitle>
            <CardDescription>
              {track.genre} • {new Date(track.uploadDate).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleLikeTrack(track.id)}
              >
                <HeartIcon className="w-4 h-4" />
                <span>{track.likes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => setActiveTrackId(activeTrackId === track.id ? null : track.id)}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{track.comments?.length || 0}</span>
              </Button>
            </div>
            
            <Button variant="outline" size="sm" onClick={() => navigate(`/mixes?trackId=${track.id}`)}>
              Play Track
            </Button>
          </CardFooter>
          
          {/* Comments Section */}
          {activeTrackId === track.id && (
            <div className="px-6 pb-6">
              <div className="space-y-4">
                {track.comments && track.comments.length > 0 ? (
                  <div className="space-y-2">
                    {track.comments.map(comment => (
                      <div key={comment.id} className="bg-muted p-3 rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{comment.username}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p>{comment.text}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-2">
                    No comments yet. Be the first to comment!
                  </p>
                )}
                
                {isAuthenticated && (
                  <div className="flex gap-2">
                    <Input
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1"
                    />
                    <Button onClick={() => handleAddComment(track.id)}>
                      Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default UserTracksTab;
