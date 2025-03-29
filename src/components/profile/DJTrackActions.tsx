
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/models/Track';

interface DJTrackActionsProps {
  track: Track;
  onEdit: (trackId: string) => void;
  onDelete: (track: Track) => void;
}

/**
 * Component that renders edit and delete buttons for track management
 * Only displayed for users with appropriate permissions
 */
const DJTrackActions: React.FC<DJTrackActionsProps> = ({ 
  track, 
  onEdit, 
  onDelete 
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onEdit(track.id)}
        className="h-8 w-8 text-blue"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onDelete(track)}
        className="h-8 w-8 text-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default DJTrackActions;
