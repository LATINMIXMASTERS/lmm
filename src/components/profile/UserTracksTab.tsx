
import React, { useState } from 'react';
import { Music, Heart, Share2, MessageCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Track } from '@/models/Track';
import { User } from '@/contexts/AuthContext';
import CommentSection from '@/components/CommentSection';

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
  const [expandedCommentTracks, setExpandedCommentTracks] = useState<Record<string, boolean>>({});
  const [likedTracks, setLikedTracks] = useState<Record<string, boolean>>({});

  const handlePlayTrack = (trackId: string) => {
    setCurrentPlayingTrack(trackId === currentPlayingTrack ? null : trackId);
  };

  const handleLikeTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isAuthenticated) {
      likeTrack(trackId);
      setLikedTracks(prev => ({
        ...prev,
        [trackId]: !prev[trackId]
      }));
      showToast('Track liked', 'This track has been added to your favorites');
    } else {
      showToast('Authentication required', 'Please log in to like tracks', 'destructive');
    }
  };

  const handleShareTrack = (track: Track, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/mixes?track=${track.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${track.artist} - ${track.title}`,
        text: `Check out this awesome track on Latin Mix Masters!`,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        navigator.clipboard.writeText(shareUrl);
        showToast('Link copied', 'Track link copied to clipboard');
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      showToast('Link copied', 'Track link copied to clipboard');
    }
  };

  const toggleComments = (trackId: string) => {
    setExpandedCommentTracks(prev => ({
      ...prev,
      [trackId]: !prev[trackId]
    }));
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
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              {/* Track cover and info */}
              <div className="flex items-start space-x-4">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <img
                    src={track.coverImage}
                    alt={`${track.title} cover`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute inset-0 w-full h-full bg-black/40 hover:bg-black/60 rounded-md"
                    onClick={() => handlePlayTrack(track.id)}
                  >
                    {currentPlayingTrack === track.id ? (
                      <span className="text-white text-xs">■</span>
                    ) : (
                      <span className="text-white text-xs">▶</span>
                    )}
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{track.title}</h3>
                  <p className="text-sm text-muted-foreground">{track.artist}</p>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full text-xs">
                      {track.genre}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Track Actions */}
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
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
              </div>
            </div>
            
            {/* Social Actions */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={(e) => handleLikeTrack(track.id, e)}
                >
                  <Heart className={`w-4 h-4 ${likedTracks[track.id] ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{track.likes || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={() => toggleComments(track.id)}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{track.comments?.length || 0}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                  onClick={(e) => handleShareTrack(track, e)}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {new Date(track.uploadDate).toLocaleDateString()}
              </div>
            </div>
            
            {/* Comments Section */}
            {expandedCommentTracks[track.id] && (
              <CommentSection
                comments={track.comments || []}
                newComment={newComments[track.id] || ''}
                onCommentChange={(value) => handleCommentChange(track.id, value)}
                onSubmitComment={(e) => handleSubmitComment(track.id, e)}
              />
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default UserTracksTab;
