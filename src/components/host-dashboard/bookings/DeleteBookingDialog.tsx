
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteBookingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export const DeleteBookingDialog: React.FC<DeleteBookingDialogProps> = ({
  isOpen,
  onOpenChange,
  onConfirm
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this booking? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
