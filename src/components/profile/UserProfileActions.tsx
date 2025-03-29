
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useShareProfile } from '@/hooks/useShareProfile';
import { User } from '@/contexts/auth/types';

interface UserProfileActionsProps {
  profileUser: User;
}

const UserProfileActions: React.FC<UserProfileActionsProps> = ({ profileUser }) => {
  const { handleShareProfile } = useShareProfile(profileUser);
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleShareProfile}
      className="flex items-center gap-1"
    >
      <Share2 className="h-4 w-4" />
      Share Profile
    </Button>
  );
};

export default UserProfileActions;
