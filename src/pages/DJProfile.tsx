
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { TabsContent } from '@/components/ui/tabs';
import { Track } from '@/models/Track';
import { User } from '@/contexts/auth/types';
import MainLayout from '@/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';
import DJProfileHeader from '@/components/profile/DJProfileHeader';
import DJProfileTabs from '@/components/profile/DJProfileTabs';
import RadioShowsTab from '@/components/profile/RadioShowsTab';
import MixesTabContent from '@/components/profile/MixesTabContent';
import UserNotFound from '@/components/profile/UserNotFound';
import { useAuth } from '@/contexts/AuthContext';
import { djProfileUsers } from '@/utils/djProfileUtils'; // Sample DJ data
import useDJProfileActions from '@/hooks/useDJProfileActions';
import { MouseEvent, FormEvent } from 'react';

// Extended User interface to include optional fields that might only exist on DJ profiles
interface ExtendedUser extends Omit<User, 'email'> {
  title?: string;
  avatarUrl?: string;
  email?: string;
  bio?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    soundcloud?: string;
  };
}

const DJProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const [djProfile, setDjProfile] = useState<ExtendedUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("radio");
  const [selectedGenre, setSelectedGenre] = useState("all");
  
  useEffect(() => {
    // Fetch DJ profile data
    const fetchDJ = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call with sample data
        const foundDJ = djProfileUsers.find(dj => dj.username === username);
        
        if (foundDJ) {
          setDjProfile({
            id: foundDJ.id,
            username: foundDJ.username,
            isAdmin: foundDJ.isAdmin,
            title: foundDJ.title,
            avatarUrl: foundDJ.avatarUrl,
            bio: foundDJ.bio,
            socialLinks: foundDJ.socialLinks
          });
        } else {
          setDjProfile(null);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load DJ profile",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (username) {
      fetchDJ();
    }
  }, [username, toast]);
  
  // If profile is found, initialize DJProfileActions
  const djActions = djProfile ? useDJProfileActions(djProfile) : null;
  
  // If still loading or no DJ found
  if (isLoading) return <MainLayout>Loading...</MainLayout>;
  if (!djProfile) return <UserNotFound />;
  
  // Extract needed properties from djActions
  const { 
    hostStations, 
    upcomingShows, 
    djBookings,
    handleTrackOperations,
    trackInteractions,
    userTracks,
    filteredTracks,
    djStations
  } = djActions || {
    hostStations: [],
    upcomingShows: [],
    djBookings: [],
    handleTrackOperations: {
      handleEditTrack: (_: string) => {}
    },
    trackInteractions: {
      handlePlayTrack: (_: string) => {},
      handleLikeTrack: (_: string, __: MouseEvent) => {},
      handleShareTrack: (_: string, __: MouseEvent) => {},
      handleCommentChange: (_: string, __: string) => {},
      handleSubmitComment: (_: string, __: FormEvent) => {},
      newComments: {}
    },
    userTracks: [],
    filteredTracks: [],
    djStations: []
  };
  
  // Create a safe user object for the DJProfileHeader
  const safeUserObj: ExtendedUser = {
    id: djProfile.id,
    username: djProfile.username,
    isAdmin: djProfile.isAdmin || false,
    title: djProfile.title,
    avatarUrl: djProfile.avatarUrl,
    bio: djProfile.bio,
    socialLinks: djProfile.socialLinks
  };
  
  return (
    <MainLayout>
      <div className="container py-8">
        <DJProfileHeader 
          user={safeUserObj} 
          stations={hostStations}
          upcomingShows={upcomingShows}
          onToggleFollow={djActions?.toggleFollow}
          isLoading={djActions?.loading || false}
        />
        
        <DJProfileTabs 
          activeTab={selectedTab} 
          onTabChange={setSelectedTab}
          genreFilter={selectedGenre}
          onGenreChange={setSelectedGenre}
        />
        
        <div className="mt-6">
          <TabsContent value="radio" className="space-y-4">
            <RadioShowsTab stations={djStations} bookings={djBookings} />
          </TabsContent>
          
          <TabsContent value="mixes" className="space-y-4">
            <MixesTabContent 
              tracks={filteredTracks}
              onLike={(trackId, e) => {
                const track = userTracks.find(t => t.id === trackId);
                if (track) trackInteractions.handleLikeTrack(track);
              }}
              onShare={(trackId, e) => {
                const track = userTracks.find(t => t.id === trackId);
                if (track) trackInteractions.handleShareTrack(track);
              }}
              onPlay={trackInteractions.handlePlayTrack}
              onComment={(trackId, e: FormEvent) => {
                const comment = trackInteractions.newComments[trackId] || '';
                trackInteractions.handleSubmitComment(trackId, comment);
              }}
              onCommentChange={trackInteractions.handleCommentChange}
              newComments={trackInteractions.newComments}
              currentUserId={user?.id || ''}
              isDJ={true}
            />
          </TabsContent>
        </div>
      </div>
    </MainLayout>
  );
};

export default DJProfile;
