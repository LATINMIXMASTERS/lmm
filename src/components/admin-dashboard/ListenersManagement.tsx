
import React, { useState } from 'react';
import { useRadio } from '@/hooks/useRadioContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const ListenersManagement: React.FC = () => {
  const { stations, updateStationListeners } = useRadio();
  const { toast } = useToast();
  const [listenerCounts, setListenerCounts] = useState<Record<string, number>>(
    stations.reduce((acc, station) => ({
      ...acc,
      [station.id]: station.listeners || 0
    }), {})
  );

  const handleListenerChange = (stationId: string, value: string) => {
    const count = parseInt(value, 10);
    if (!isNaN(count) && count >= 0) {
      setListenerCounts(prev => ({
        ...prev,
        [stationId]: count
      }));
    }
  };

  const handleUpdateListeners = (stationId: string) => {
    updateStationListeners(stationId, listenerCounts[stationId]);
    toast({
      title: "Listeners updated",
      description: "The station's listener count has been updated successfully."
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Station Listeners</CardTitle>
        <CardDescription>
          Update the current listener count for each station
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Station</TableHead>
              <TableHead>Current Listeners</TableHead>
              <TableHead>New Listener Count</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stations.map(station => (
              <TableRow key={station.id}>
                <TableCell className="font-medium">{station.name}</TableCell>
                <TableCell>{station.listeners || 0}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={listenerCounts[station.id]}
                      onChange={(e) => handleListenerChange(station.id, e.target.value)}
                      className="w-24"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdateListeners(station.id)}
                  >
                    Update
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ListenersManagement;
