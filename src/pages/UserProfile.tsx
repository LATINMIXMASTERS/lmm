
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Share2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { ToastAction } from '@/components/ui/toast';
import ProfileEditor from '@/components/ProfileEditor';
import UserNotFound from '@/components/profile/UserNotFound';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserTracksTab from '@/components/profile/UserTracksTab';
import ActivityTab from '@/components/profile/ActivityTab';
import { useTrackManagement } from '@/hooks/track/useTrackManagement';
import { Track } from '@/models/Track';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, isAuthenticated, user, updateProfile } = useAuth();
  const { tracks, getTracksByUser, likeTrack, addComment } = useTrack();
  const { handleEditTrack, handleDeleteTrack, canUserEditTrack } = useTrackManagement();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
        <UserNotFound />
      </MainLayout>
    );
  }
  
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
  
  // Handle profile sharing
  const handleShareProfile = () => {
    // Create a URL-friendly version of the username
    const usernameSlug = profileUser.username.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const shareUrl = `${window.location.origin}/profile/${usernameSlug}/${profileUser.id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${profileUser.username}'s Profile - Latin Mix Masters`,
        text: `Check out ${profileUser.username}'s profile on Latin Mix Masters!`,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        copyProfileLink(shareUrl);
      });
    } else {
      copyProfileLink(shareUrl);
    }
  };
  
  // Copy profile link to clipboard
  const copyProfileLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: `${profileUser.username}'s profile link copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the profile link to clipboard",
        variant: "destructive"
      });
    });
  };
  
  // If in edit mode, show the profile editor
  if (editMode && isOwnProfile) {
    return (
      <MainLayout>
        <div className="container py-8 md:py-12">
          <div className="mb-6">
            <button 
              className="px-4 py-2 border rounded hover:bg-gray-50"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
          </div>
          <ProfileEditor 
            user={profileUser} 
            onSave={handleProfileUpdate} 
          />
        </div>
      </MainLayout>
    );
  }
  
  // Show toast helper function for child components
  const showToast = (title: string, description: string, variant?: 'default' | 'destructive') => {
    toast({
      title,
      description,
      variant
    });
  };

  // Wrapper functions to adapt the parameters for UserTracksTab
  const handleTrackLike = (trackId: string) => {
    likeTrack(trackId);
  };

  const handleTrackEdit = (trackId: string) => {
    handleEditTrack(trackId);
  };

  // Fixed: Updated to accept Track object instead of string
  const handleTrackDelete = (track: Track) => {
    handleDeleteTrack(track);
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header with Share Button */}
          <div className="flex justify-between items-start mb-6">
            <ProfileHeader 
              profileUser={profileUser} 
              isOwnProfile={isOwnProfile} 
              setEditMode={setEditMode} 
            />
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShareProfile}
              className="flex items-center gap-1"
            >
              <Share2 className="h-4 w-4" />
              Share Profile
            </Button>
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            {/* Tracks Tab */}
            <TabsContent value="tracks">
              <UserTracksTab
                userId={userId || ""}
                isRadioHost={!!profileUser.isRadioHost}
                userTracks={userTracks}
                isAuthenticated={isAuthenticated}
                likeTrack={handleTrackLike}
                addComment={addComment}
                showToast={showToast}
                user={user}
                handleEditTrack={handleTrackEdit}
                handleDeleteTrack={handleTrackDelete}
                canUserEditTrack={canUserEditTrack}
              />
            </TabsContent>
            
            {/* Activity Tab */}
            <TabsContent value="activity">
              <ActivityTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
