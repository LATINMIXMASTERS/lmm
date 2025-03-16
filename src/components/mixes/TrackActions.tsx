
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Track } from '@/models/Track';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

/**
 * Props for the TrackActions component
 */
interface TrackActionsProps {
  track: Track;
  onEdit: (trackId: string, e: React.MouseEvent) => void;
  onDelete: (trackId: string) => void;
}

/**
 * Component that displays edit and delete action buttons for a track
 * The delete action includes a confirmation dialog to prevent accidental deletion
 */
const TrackActions: React.FC<TrackActionsProps> = ({ track, onEdit, onDelete }) => {
  return (
    <div className="flex space-x-2">
      {/* Edit track button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={(e) => onEdit(track.id, e)}
        title="Edit track"
      >
        <Edit className="h-4 w-4" />
      </Button>
      
      {/* Delete track button with confirmation dialog */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => e.stopPropagation()}
            title="Delete track"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this track.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => onDelete(track.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrackActions;
