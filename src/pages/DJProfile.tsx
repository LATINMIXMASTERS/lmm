
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
import { djProfileUsers } from '@/utils/djProfileUtils';
import useDJProfileActions from '@/hooks/useDJProfileActions';
import { MouseEvent, FormEvent } from 'react';

// Extended User interface to include optional fields that might only exist on DJ profiles
interface ExtendedUser extends User {
  title?: string;
  avatarUrl?: string;
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
            isAdmin: foundDJ.isAdmin || false,
            title: foundDJ.title,
            avatarUrl: foundDJ.avatarUrl,
            bio: foundDJ.bio,
            socialLinks: foundDJ.socialLinks,
            email: '', // Add required email field
            isRadioHost: foundDJ.isRadioHost || false // Add isRadioHost field
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
      handleLikeTrack: (_: Track) => {},
      handleShareTrack: (_: Track) => {},
      handleCommentChange: (_: string, __: string) => {},
      handleSubmitComment: (_: string, __: string) => {},
      newComments: {}
    },
    userTracks: [],
    filteredTracks: [],
    djStations: []
  };
  
  return (
    <MainLayout>
      <div className="container py-8">
        <DJProfileHeader 
          hostUser={djProfile}
          onEditProfile={() => {}} 
        />
        
        <DJProfileTabs 
          djUser={djProfile}
          userTracks={userTracks}
          filteredTracks={filteredTracks}
          selectedTabGenre={selectedGenre}
          setSelectedTabGenre={setSelectedGenre}
          currentPlayingTrack={null}
          genres={[]} // Add appropriate genres
          user={user}
          djStations={djStations}
          djBookings={djBookings}
          handlePlayTrack={trackInteractions.handlePlayTrack}
          handleLikeTrack={(trackId, e) => {
            const track = userTracks.find(t => t.id === trackId);
            if (track) trackInteractions.handleLikeTrack(track);
          }}
          handleShareTrack={(trackId, e) => {
            const track = userTracks.find(t => t.id === trackId);
            if (track) trackInteractions.handleShareTrack(track);
          }}
          newComments={trackInteractions.newComments}
          handleCommentChange={trackInteractions.handleCommentChange}
          handleSubmitComment={(trackId, e) => trackInteractions.handleSubmitComment(trackId, trackInteractions.newComments[trackId] || '')}
          formatDuration={(seconds) => {
            const minutes = Math.floor(seconds! / 60);
            const remainingSecs = Math.floor(seconds! % 60);
            return `${minutes}:${remainingSecs.toString().padStart(2, '0')}`;
          }}
          renderTrackActions={() => null}
          startListening={() => {}}
        />
      </div>
    </MainLayout>
  );
};

export default DJProfile;
