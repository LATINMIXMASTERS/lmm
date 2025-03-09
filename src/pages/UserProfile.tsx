
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, HeartIcon, MessageSquare } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, isAuthenticated, user } = useAuth();
  const { tracks, getTracksByUser, likeTrack, addComment } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newComment, setNewComment] = useState('');
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  
  // Find profile user
  const profileUser = users.find(u => u.id === userId);
  const userTracks = profileUser ? getTracksByUser(profileUser.id) : [];
  
  // User not found
  if (!profileUser) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <User className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  // Handle like track
  const handleLikeTrack = (trackId: string) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to like tracks",
        variant: "destructive"
      });
      return;
    }
    
    likeTrack(trackId);
    toast({
      title: "Track Liked",
      description: "You've liked this track"
    });
  };
  
  // Handle add comment
  const handleAddComment = (trackId: string) => {
    if (!user || !newComment.trim()) return;
    
    addComment(trackId, {
      userId: user.id,
      username: user.username,
      text: newComment.trim()
    });
    
    setNewComment('');
    setActiveTrackId(null);
    
    toast({
      title: "Comment Added",
      description: "Your comment has been added to this track"
    });
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage src={`https://api.dicebear.com/7.x/personas/svg?seed=${profileUser.username}`} alt={profileUser.username} />
              <AvatarFallback>{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{profileUser.username}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {profileUser.isRadioHost && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Radio Host</span>
                )}
                {profileUser.isAdmin && (
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Admin</span>
                )}
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  Joined {new Date(profileUser.registeredAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
              
              <p className="text-muted-foreground mb-4">
                {profileUser.isRadioHost 
                  ? `${profileUser.username} is a registered DJ on Latin Mix Masters with ${userTracks.length} uploaded tracks.`
                  : `${profileUser.username} is a member of the Latin Mix Masters community.`}
              </p>
            </div>
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            {/* Tracks Tab */}
            <TabsContent value="tracks">
              {profileUser.isRadioHost ? (
                userTracks.length > 0 ? (
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
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <p className="text-muted-foreground mb-4">This DJ hasn't uploaded any tracks yet.</p>
                    </CardContent>
                  </Card>
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">This user is not a registered DJ and cannot upload tracks.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <p className="text-muted-foreground">User activity will be shown here in the future.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
