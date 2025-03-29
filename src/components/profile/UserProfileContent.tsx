
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserTracksTab from '@/components/profile/UserTracksTab';
import ActivityTab from '@/components/profile/ActivityTab';
import ProfileHeader from '@/components/profile/ProfileHeader';
import UserProfileActions from '@/components/profile/UserProfileActions';
import { User } from '@/contexts/auth/types';
import { Track } from '@/models/Track';

interface UserProfileContentProps {
  profileUser: User;
  isOwnProfile: boolean; 
  setEditMode: (editMode: boolean) => void;
  userTracks: Track[];
  isAuthenticated: boolean;
  likeTrack: (trackId: string) => void;
  addComment: (trackId: string, comment: any) => void;
  showToast: (title: string, description: string, variant?: 'default' | 'destructive') => void;
  user: User | null;
  handleTrackEdit: (trackId: string) => void;
  handleTrackDelete: (track: Track) => void;
  canUserEditTrack: (trackId: string) => boolean;
}

const UserProfileContent: React.FC<UserProfileContentProps> = ({
  profileUser,
  isOwnProfile,
  setEditMode,
  userTracks,
  isAuthenticated,
  likeTrack,
  addComment,
  showToast,
  user,
  handleTrackEdit,
  handleTrackDelete,
  canUserEditTrack
}) => {
  return (
    <div className="container py-8 md:py-12">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header with Share Button */}
        <div className="flex justify-between items-start mb-6">
          <ProfileHeader 
            profileUser={profileUser} 
            isOwnProfile={isOwnProfile} 
            setEditMode={setEditMode} 
          />
          
          <UserProfileActions profileUser={profileUser} />
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
              userId={profileUser.id}
              isRadioHost={!!profileUser.isRadioHost}
              userTracks={userTracks}
              isAuthenticated={isAuthenticated}
              likeTrack={likeTrack}
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
  );
};

export default UserProfileContent;
