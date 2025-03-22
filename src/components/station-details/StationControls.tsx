
import React from 'react';
import { Play, Pause, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StationControlsProps {
  isPlaying: boolean;
  listeners: number;
  isPrivilegedUser: boolean;
  onPlayToggle: () => void;
  onBookShow: () => void;
}

const StationControls: React.FC<StationControlsProps> = ({ 
  isPlaying, 
  listeners, 
  isPrivilegedUser, 
  onPlayToggle, 
  onBookShow 
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Button 
        onClick={onPlayToggle}
        variant="default"
        className="flex items-center gap-2"
      >
        {isPlaying ? (
          <>
            <Pause className="w-4 h-4" />
            Stop
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Play
          </>
        )}
      </Button>
      
      {/* Only show Book a Show button to privileged users */}
      {isPrivilegedUser && (
        <Button 
          onClick={onBookShow}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Book a Show
        </Button>
      )}
      
      <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
        <Users className="w-4 h-4" />
        <span>{listeners} listeners</span>
      </div>
    </div>
  );
};

export default StationControls;
