
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for track management functionality
 * Provides handlers for editing, deleting, and permission checks
 */
export const useTrackManagement = () => {
  const { user } = useAuth();
  const { deleteTrack, canEditTrack } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Navigates to edit track page
   * @param trackId - ID of the track to edit
   * @param e - Mouse event (used to stop event propagation)
   */
  const handleEditTrack = (trackId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/edit-track/${trackId}`);
  };

  /**
   * Handles track deletion
   * @param trackId - ID of the track to delete
   */
  const handleDeleteTrack = (trackId: string) => {
    deleteTrack(trackId);
  };

  /**
   * Checks if the current user can edit a specific track
   * @param trackId - ID of the track to check permissions for
   * @returns Boolean indicating whether user can edit the track
   */
  const canUserEditTrack = (trackId: string): boolean => {
    return canEditTrack(trackId);
  };

  return {
    handleEditTrack,
    handleDeleteTrack,
    canUserEditTrack
  };
};
