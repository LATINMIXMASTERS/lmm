
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, Radio } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const BookShow: React.FC = () => {
  const { stationId } = useParams<{ stationId: string }>();
  const { isAuthenticated, user } = useAuth();
  const { stations, addBooking } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [station, setStation] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (stationId) {
      const foundStation = stations.find(s => s.id === stationId);
      if (foundStation) {
        setStation(foundStation);
      } else {
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    } else {
      navigate('/stations');
    }
  }, [stationId, stations, isAuthenticated, navigate, toast]);

  const handleBookShow = () => {
    toast({
      title: "Request Submitted",
      description: "Your booking request has been submitted for approval",
    });
    navigate('/stations');
  };

  if (!station) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-4">Book a Show on {station.name}</h1>
        <Card>
          <CardHeader>
            <CardTitle>Station Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <img src={station.image} alt={station.name} className="w-20 h-20 rounded-md object-cover" />
              <div>
                <h2 className="font-semibold">{station.name}</h2>
                <p className="text-sm text-muted-foreground">Genre: {station.genre}</p>
                <p className="text-sm text-muted-foreground">Current listeners: {station.listeners}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Button onClick={handleBookShow} className="w-full">
                Book Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookShow;
