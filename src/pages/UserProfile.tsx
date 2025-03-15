
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import ProfileEditor from '@/components/ProfileEditor';
import UserNotFound from '@/components/profile/UserNotFound';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserTracksTab from '@/components/profile/UserTracksTab';
import ActivityTab from '@/components/profile/ActivityTab';

const UserProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { users, isAuthenticated, user, updateProfile } = useAuth();
  const { tracks, getTracksByUser, likeTrack, addComment } = useTrack();
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
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader 
            profileUser={profileUser} 
            isOwnProfile={isOwnProfile} 
            setEditMode={setEditMode} 
          />
          
          {/* Content Tabs */}
          <Tabs defaultValue="tracks" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="tracks">Tracks</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            {/* Tracks Tab */}
            <TabsContent value="tracks">
              <UserTracksTab
                isRadioHost={!!profileUser.isRadioHost}
                userTracks={userTracks}
                isAuthenticated={isAuthenticated}
                likeTrack={likeTrack}
                addComment={addComment}
                showToast={showToast}
                user={user}
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
