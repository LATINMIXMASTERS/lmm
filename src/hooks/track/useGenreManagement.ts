
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for genre management functionality
 * Provides a handler for navigating to genre management with permission checks
 */
export const useGenreManagement = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Handles genre management navigation with permission checks
   * Only radio hosts and admins can manage genres
   */
  const handleManageGenres = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to manage genres",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (user && !user.isRadioHost && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only approved radio hosts and admins can manage genres",
        variant: "destructive"
      });
      return;
    }

    navigate('/manage-genres');
  };

  return {
    handleManageGenres
  };
};
