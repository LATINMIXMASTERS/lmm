
import React from 'react';
import { Clock } from 'lucide-react';

interface StationDescriptionProps {
  description: string;
  broadcastTime?: string;
}

const StationDescription: React.FC<StationDescriptionProps> = ({ 
  description, 
  broadcastTime 
}) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">About this Station</h3>
      <p>{description || "No description available."}</p>
      
      {broadcastTime && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Broadcast Schedule</h3>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{broadcastTime}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StationDescription;
