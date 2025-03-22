
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

/**
 * Custom hook for checking upload permissions
 * Redirects unauthorized users and shows appropriate messages
 */
export const useUploadPermission = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to upload tracks",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Check if user is a host
    if (user && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only registered hosts can upload tracks",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  return { isAuthenticated, user };
};
