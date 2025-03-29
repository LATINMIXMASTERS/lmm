
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
