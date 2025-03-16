
import React from 'react';
import { Clock, Radio } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioStation } from '@/models/RadioStation';

interface StationInfoCardProps {
  station: RadioStation;
}

const StationInfoCard: React.FC<StationInfoCardProps> = ({ station }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Station Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
          <img src={station.image} alt={station.name} className="w-20 h-20 rounded-md object-cover" />
          <div>
            <h2 className="font-semibold">{station.name}</h2>
            <p className="text-sm text-muted-foreground">Genre: {station.genre}</p>
            <div className="flex items-center text-sm text-muted-foreground">
              <Radio className="h-3 w-3 mr-1" />
              <span>{station.listeners} listeners</span>
            </div>
          </div>
        </div>
        
        {station.broadcastTime && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
            <Clock className="h-4 w-4" />
            <span>Regular broadcast: {station.broadcastTime}</span>
          </div>
        )}
        
        {station.streamDetails && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h3 className="text-sm font-medium mb-2">Shoutcast Stream Info:</h3>
            <div className="text-xs space-y-1">
              <p>Server: {station.streamDetails.url}</p>
              <p>Port: {station.streamDetails.port}</p>
            </div>
          </div>
        )}
        
        <div className="mt-4 text-sm">
          <p>Before booking, please note:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
            <li>Verified hosts can book shows instantly</li>
            <li>Time slots are 1-4 hours in duration</li>
            <li>You cannot book shows in the past</li>
            <li>Please be ready 15 minutes before your slot</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default StationInfoCard;
