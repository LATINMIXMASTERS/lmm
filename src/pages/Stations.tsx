
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '@/layout/MainLayout';
import { useRadio } from '@/contexts/RadioContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioStation } from '@/models/RadioStation';

interface StationCardProps {
  station: RadioStation;
}

const StationCard: React.FC<StationCardProps> = ({ station }) => (
  <Card className="overflow-hidden">
    <div className="aspect-video relative">
      <img
        src={station.image}
        alt={station.name}
        className="object-cover w-full h-full"
      />
    </div>
    <CardHeader>
      <CardTitle>{station.name}</CardTitle>
      <CardDescription>{station.genre}</CardDescription>
    </CardHeader>
    <CardContent>
      {station.description}
    </CardContent>
  </Card>
);

const Stations: React.FC = () => {
  const { stations } = useRadio();
  const { users } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStations, setFilteredStations] = useState<RadioStation[]>(stations);

  useEffect(() => {
    const filtered = stations.filter(station =>
      station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      station.genre.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStations(filtered);
  }, [searchQuery, stations]);

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto mb-8">
          <div className="grid gap-2">
            <Label htmlFor="search">Search Stations</Label>
            <Input
              type="search"
              id="search"
              placeholder="Search by name or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStations.map(station => (
            <div key={station.id} className="mb-8">
              <Link to={`/stations/${station.id}`} className="block hover:opacity-90 transition-opacity">
                <StationCard station={station} />
              </Link>
              
              {/* Add host information with links */}
              {station.hosts && station.hosts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">Hosted by:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {station.hosts.map(hostId => {
                      const hostUser = users.find(u => u.id === hostId);
                      return hostUser ? (
                        <Link 
                          key={hostId} 
                          to={`/host/${hostId}`}
                          className="text-sm text-blue hover:underline"
                        >
                          {hostUser.username}
                        </Link>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default Stations;
