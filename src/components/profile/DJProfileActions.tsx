
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { User } from '@/contexts/auth/types';
import { useShareProfile } from '@/hooks/useShareProfile';

interface DJProfileActionsProps {
  djUser: User;
}

const DJProfileActions: React.FC<DJProfileActionsProps> = ({ djUser }) => {
  const { handleShareProfile } = useShareProfile(djUser);
  
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

export default DJProfileActions;
