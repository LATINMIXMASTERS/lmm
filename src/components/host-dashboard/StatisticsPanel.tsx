
import React from 'react';
import { BarChart2, Music, Users } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Track } from '@/models/Track';

interface StatisticsPanelProps {
  tracks: Track[];
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ tracks }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <BarChart2 className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-2xl font-bold">{tracks.reduce((sum, track) => sum + (track.plays || track.playCount || 0), 0)}</h3>
                <p className="text-sm text-muted-foreground">Total Plays</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Music className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-2xl font-bold">{tracks.length}</h3>
                <p className="text-sm text-muted-foreground">Total Mixes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                <h3 className="text-2xl font-bold">{tracks.reduce((sum, track) => sum + track.likes, 0)}</h3>
                <p className="text-sm text-muted-foreground">Total Likes</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Top Performing Mixes</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mix</TableHead>
                <TableHead>Plays</TableHead>
                <TableHead>Likes</TableHead>
                <TableHead>Comments</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tracks
                .sort((a, b) => (b.plays || b.playCount || 0) - (a.plays || a.playCount || 0))
                .slice(0, 5)
                .map(track => (
                  <TableRow key={track.id}>
                    <TableCell className="font-medium">{track.title}</TableCell>
                    <TableCell>{track.plays || track.playCount || 0}</TableCell>
                    <TableCell>{track.likes}</TableCell>
                    <TableCell>{track.comments?.length || 0}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatisticsPanel;
