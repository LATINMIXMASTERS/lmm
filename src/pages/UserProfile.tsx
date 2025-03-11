
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, HeartIcon, MessageSquare, Link as LinkIcon, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import ProfileEditor from '@/components/ProfileEditor';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, isAuthenticated, user, updateProfile } = useAuth();
  const { tracks, getTracksByUser, likeTrack, addComment } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newComment, setNewComment] = useState('');
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Find profile user
  const profileUser = users.find(u => u.id === userId);
  const userTracks = profileUser ? getTracksByUser(profileUser.id) : [];
  
  // Check if this is the current user's profile
  const isOwnProfile = user && profileUser && user.id === profileUser.id;
  
  // Handle redirect to host profile for radio hosts
  useEffect(() => {
    if (profileUser?.isRadioHost) {
      navigate(`/host/${profileUser.id}`);
    }
  }, [profileUser, navigate]);
  
  // User not found
  if (!profileUser) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
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

  // Handle profile update
  const handleProfileUpdate = (userData: Partial<typeof profileUser>) => {
    if (isOwnProfile && updateProfile) {
      updateProfile(userData);
      setEditMode(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated"
      });
    }
  };
  
  // If in edit mode, show the profile editor
  if (editMode && isOwnProfile) {
    return (
      <MainLayout>
        <div className="container py-8 md:py-12">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setEditMode(false)}
              className="mb-6"
            >
              Cancel
            </Button>
          </div>
          <ProfileEditor 
            user={profileUser} 
            onSave={handleProfileUpdate} 
          />
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
            <Avatar className="h-24 w-24 md:h-32 md:w-32">
              <AvatarImage 
                src={profileUser.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${profileUser.username}`} 
                alt={profileUser.username} 
              />
              <AvatarFallback>{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">{profileUser.username}</h1>
                {isOwnProfile && (
                  <Button 
                    variant="outline" 
                    onClick={() => setEditMode(true)}
                    className="mt-2 md:mt-0"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
              
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
              
              {/* Biography */}
              {profileUser.biography && (
                <p className="text-muted-foreground mb-4">
                  {profileUser.biography}
                </p>
              )}
              
              {/* Social Links */}
              {profileUser.socialLinks && Object.values(profileUser.socialLinks).some(link => !!link) && (
                <div className="flex gap-3 justify-center md:justify-start mb-4">
                  {profileUser.socialLinks.facebook && (
                    <a href={profileUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Facebook size={20} />
                    </a>
                  )}
                  {profileUser.socialLinks.twitter && (
                    <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Twitter size={20} />
                    </a>
                  )}
                  {profileUser.socialLinks.instagram && (
                    <a href={profileUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Instagram size={20} />
                    </a>
                  )}
                  {profileUser.socialLinks.youtube && (
                    <a href={profileUser.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                      <Youtube size={20} />
                    </a>
                  )}
                </div>
              )}
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
