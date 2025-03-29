
import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/contexts/auth/types';

interface DJProfileActionsProps {
  djUser: User;
  onShareProfile: () => void;
}

const DJProfileActions: React.FC<DJProfileActionsProps> = ({ 
  djUser, 
  onShareProfile 
}) => {
  const { toast } = useToast();
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={onShareProfile}
      className="flex items-center gap-1"
    >
      <Share2 className="h-4 w-4" />
      Share Profile
    </Button>
  );
};

export default DJProfileActions;
