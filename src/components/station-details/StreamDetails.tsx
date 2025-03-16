
import React from 'react';
import { Lock } from 'lucide-react';

interface StreamDetailsProps {
  url: string;
  port: string;
  password: string;
}

const StreamDetails: React.FC<StreamDetailsProps> = ({ 
  url, 
  port, 
  password 
}) => {
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold mb-2">Stream Information</h3>
      <div className="p-3 bg-muted rounded-md">
        <div className="grid grid-cols-1 gap-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium">Server:</span>
            <span>{url}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Port:</span>
            <span>{port}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Password:</span>
            <span>{password}</span>
          </div>
          <div className="flex items-center text-amber-600 mt-1">
            <Lock className="w-3 h-3 mr-1" />
            <p className="text-xs">
              This information is only visible to hosts and admins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDetails;
