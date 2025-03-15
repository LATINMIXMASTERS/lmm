import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Calendar, Clock, Radio } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const StationDetails: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { stations } = useRadio();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [station, setStation] = useState<any>(null);

  useEffect(() => {
    const foundStation = stations.find(s => s.id === stationId);
    if (foundStation) {
      setStation(foundStation);
    } else {
      navigate('/stations');
    }
  }, [stationId, stations, navigate]);

  if (!station) {
    return null; // or a loading spinner
  }

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <Card>
          <CardHeader>
            <CardTitle>{station.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <img src={station.image} alt={station.name} className="w-32 h-32 rounded-md" />
              <div className="ml-4">
                <h2 className="text-xl font-bold">{station.name}</h2>
                <p className="text-sm text-muted-foreground">{station.genre}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Button onClick={() => { /* play station logic */ }}>
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  {user && (
                    <Button onClick={() => { /* manage station logic */ }}>
                      Manage
                    </Button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold">Schedule</h3>
              <p>{station.schedule}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StationDetails;
