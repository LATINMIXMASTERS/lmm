
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoPlayerCloseButtonProps {
  onClose: () => void;
}

const VideoPlayerCloseButton: React.FC<VideoPlayerCloseButtonProps> = ({ onClose }) => {
  return (
    <div className="absolute top-0 right-0 p-2">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-white bg-black/50 hover:bg-black/70 h-8 w-8 rounded-full"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default VideoPlayerCloseButton;
