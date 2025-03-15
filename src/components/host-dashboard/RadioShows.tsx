
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RadioStation } from '@/models/RadioStation';

interface RadioShowsProps {
  stations: RadioStation[];
}

const RadioShows: React.FC<RadioShowsProps> = ({ stations }) => {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Radio Shows</CardTitle>
      </CardHeader>
      <CardContent>
        {stations.length === 0 ? (
          <div className="text-center py-8">
            <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You don't have any radio shows yet</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate('/stations')}
            >
              Browse Stations
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Station</TableHead>
                <TableHead>Genre</TableHead>
                <TableHead>Listeners</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stations.map(station => (
                <TableRow key={station.id}>
                  <TableCell className="font-medium">{station.name}</TableCell>
                  <TableCell>{station.genre}</TableCell>
                  <TableCell>{station.listeners}</TableCell>
                  <TableCell>
                    {station.isLive ? (
                      <span className="flex items-center text-green-500">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Live
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Offline</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => navigate(`/stations/${station.id}`)}
                    >
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default RadioShows;
