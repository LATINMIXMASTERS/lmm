
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for track upload functionality
 * Provides a handler for navigating to track upload with permission checks
 */
export const useTrackUpload = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Handles track upload navigation with permission checks
   * Only radio hosts can upload mixes
   */
  const handleUpload = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload mixes",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts can upload mixes",
        variant: "destructive"
      });
      return;
    }

    // Update the navigation path to use "/upload" consistently
    navigate('/upload');
  };

  return {
    handleUpload
  };
};
