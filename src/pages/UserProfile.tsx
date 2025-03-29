
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import UserNotFound from '@/components/profile/UserNotFound';
import UserProfileContent from '@/components/profile/UserProfileContent';
import UserProfileEditor from '@/components/profile/UserProfileEditor';
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
  
  // Handle redirect to DJ profile for radio DJs
  useEffect(() => {
    if (profileUser?.isRadioHost) {
      navigate(`/dj/${profileUser.id}`);
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
    const mockEvent = { stopPropagation: () => {} } as React.MouseEvent;
    handleEditTrack(trackId, mockEvent);
  };

  const handleTrackDelete = (track: Track) => {
    handleDeleteTrack(track.id);
  };
  
  // If in edit mode, show the profile editor
  if (editMode && isOwnProfile) {
    return (
      <MainLayout>
        <UserProfileEditor 
          profileUser={profileUser}
          updateProfile={updateProfile}
          onCancel={() => setEditMode(false)}
        />
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <UserProfileContent
        profileUser={profileUser}
        isOwnProfile={isOwnProfile}
        setEditMode={setEditMode}
        userTracks={userTracks}
        isAuthenticated={isAuthenticated}
        likeTrack={handleTrackLike}
        addComment={addComment}
        showToast={showToast}
        user={user}
        handleTrackEdit={handleTrackEdit}
        handleTrackDelete={handleTrackDelete}
        canUserEditTrack={canUserEditTrack}
      />
    </MainLayout>
  );
};

export default UserProfile;
