
import { User } from '@/contexts/auth/types';
import { useToast } from '@/hooks/use-toast';

export const useShareProfile = (profileUser: User) => {
  const { toast } = useToast();
  
  const handleShareProfile = () => {
    // Use username for URL path
    const usernameSlug = profileUser.username.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
    const isRadioHost = profileUser.isRadioHost;
    const shareUrl = `${window.location.origin}/${isRadioHost ? 'dj' : 'profile'}/${usernameSlug}`;
    
    if (navigator.share) {
      navigator.share({
        title: `${profileUser.username}'s Profile - Latin Mix Masters`,
        text: `Check out ${profileUser.username}'s profile on Latin Mix Masters!`,
        url: shareUrl
      }).catch(error => {
        console.error('Error sharing:', error);
        copyProfileLink(shareUrl);
      });
    } else {
      copyProfileLink(shareUrl);
    }
  };
  
  const copyProfileLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link copied!",
        description: `${profileUser.username}'s profile link copied to clipboard`,
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy the profile link to clipboard",
        variant: "destructive"
      });
    });
  };
  
  return { handleShareProfile };
};

export default useShareProfile;
