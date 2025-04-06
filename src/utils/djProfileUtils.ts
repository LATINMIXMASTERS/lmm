
import { Track } from '@/models/Track';
import { User } from '@/contexts/auth/types';

/**
 * Formats a duration in seconds to MM:SS format
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Determines if a user can manage a track (edit/delete)
 */
export const canManageTrack = (user: User | null, track: Track): boolean => {
  if (!user) return false;
  return user.isAdmin || track.uploadedBy === user.id;
};

/**
 * Renders track action controls if user has permission
 */
export const createTrackActionsRenderer = (
  user: User | null,
  onEdit: (trackId: string) => void,
  onDelete: (track: Track) => void
) => {
  return (track: Track) => {
    if (!canManageTrack(user, track)) return null;
    
    return {
      track,
      onEdit,
      onDelete
    };
  };
};

// Sample DJ profile data for development/testing purposes
export const djProfileUsers = [
  {
    id: "dj1",
    username: "DJ_RhythmMaster",
    isAdmin: false,
    isRadioHost: true,
    title: "Resident DJ",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=DJ_RhythmMaster",
    bio: "Spinning the hottest tracks every weekend. Specializes in House and Techno.",
    socialLinks: {
      facebook: "https://facebook.com/djrhythmmaster",
      instagram: "https://instagram.com/djrhythmmaster",
      soundcloud: "https://soundcloud.com/djrhythmmaster"
    }
  },
  {
    id: "dj2",
    username: "BeatWizard",
    isAdmin: false,
    isRadioHost: true,
    title: "Guest DJ",
    avatarUrl: "https://api.dicebear.com/7.x/personas/svg?seed=BeatWizard",
    bio: "Creating sonic journeys through hip-hop and R&B. 10+ years of experience.",
    socialLinks: {
      twitter: "https://twitter.com/beatwizard",
      soundcloud: "https://soundcloud.com/beatwizard"
    }
  }
];
