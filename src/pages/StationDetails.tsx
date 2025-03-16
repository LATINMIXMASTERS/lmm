
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Pause, Calendar, Clock, Radio, Users, Lock, Info } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const StationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { stations, currentPlayingStation, setCurrentPlayingStation, getBookingsForStation } = useRadio();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const isPlaying = currentPlayingStation === id;
  
  // Check if user is admin or host (privileged users)
  const isPrivilegedUser = user?.isAdmin || user?.isRadioHost;

  useEffect(() => {
    if (id) {
      const foundStation = stations.find(s => s.id === id);
      if (foundStation) {
        setStation(foundStation);
        // Get this station's bookings
        const bookings = getBookingsForStation(id);
        setStationBookings(bookings.filter(b => b.approved && !b.rejected));
      } else {
        navigate('/stations');
        toast({
          title: "Station not found",
          description: "The station you're looking for doesn't exist",
          variant: "destructive"
        });
      }
    }
  }, [id, stations, getBookingsForStation, navigate, toast]);

  if (!station) {
    return null;
  }

  const handlePlayToggle = () => {
    if (isPlaying) {
      setCurrentPlayingStation(null);
    } else {
      if (station?.streamUrl) {
        setCurrentPlayingStation(station.id);
        toast({
          title: "Now Playing",
          description: `${station.name} - Shoutcast stream started`
        });
      } else {
        toast({
          title: "Stream Not Available",
          description: "This station doesn't have a stream URL configured.",
          variant: "destructive"
        });
      }
    }
  };

  const handleBookShow = () => {
    navigate(`/book-show/${station.id}`);
  };

  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <Card className="overflow-hidden">
          <div className="h-48 md:h-64 relative">
            <img 
              src={station.image} 
              alt={station.name} 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
              <h1 className="text-2xl md:text-3xl font-bold">{station.name}</h1>
              <p className="text-sm md:text-base opacity-90">{station.genre}</p>
            </div>
          </div>
          
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <Button 
                onClick={handlePlayToggle}
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
                  onClick={handleBookShow}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  Book a Show
                </Button>
              )}
              
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Users className="w-4 h-4" />
                <span>{station.listeners} listeners</span>
              </div>
            </div>
            
            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-semibold mb-2">About this Station</h3>
              <p>{station.description || "No description available."}</p>
              
              {station.broadcastTime && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Broadcast Schedule</h3>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{station.broadcastTime}</span>
                  </div>
                </div>
              )}
              
              {/* Only show stream details to privileged users */}
              {isPrivilegedUser && station.streamDetails && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Stream Information</h3>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="grid grid-cols-1 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Server:</span>
                        <span>{station.streamDetails.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Port:</span>
                        <span>{station.streamDetails.port}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Password:</span>
                        <span>{station.streamDetails.password}</span>
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
              )}
              
              {/* Show streaming instructions for hosts */}
              {isPrivilegedUser && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Info className="w-4 h-4 mr-2" />
                    Streaming Instructions
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
                    <h4 className="font-semibold mb-2">Instructions for BUTT (Broadcast Using This Tool)</h4>
                    <ol className="list-decimal pl-5 space-y-2 text-sm">
                      <li>Download and install BUTT from <a href="https://danielnoethen.de/butt/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://danielnoethen.de/butt/</a></li>
                      <li>Open BUTT and go to Settings</li>
                      <li>In the "Server" tab, click "Add" to create a new server</li>
                      <li>Enter a name for your server (e.g., "{station.name}")</li>
                      <li>Set the server type to "Shoutcast"</li>
                      <li>Enter your stream URL in the "Address" field: {station.streamDetails?.url || "Not configured"}</li>
                      <li>Enter your port number in the "Port" field: {station.streamDetails?.port || "Not configured"}</li>
                      <li>Enter your stream password in the "Password" field</li>
                      <li>In the "Audio" tab, select your microphone or audio input device</li>
                      <li>Click "Save" to save your settings</li>
                      <li>In the main BUTT window, select your server from the dropdown menu</li>
                      <li>Click "Play" to start broadcasting to your station</li>
                    </ol>
                    
                    <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        <strong>Tip:</strong> For the best audio quality, configure BUTT settings to use MP3 encoding with a bitrate of at least 128 kbps. For talk shows, you can use a lower bitrate (64-96 kbps), while music shows should use higher bitrates (128-320 kbps).
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Show upcoming bookings/shows calendar */}
              {stationBookings.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Upcoming Shows</h3>
                  <div className="space-y-2">
                    {stationBookings.map((booking) => (
                      <div key={booking.id} className="p-3 bg-accent/30 rounded-md">
                        <h4 className="font-medium">{booking.title}</h4>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          <span>
                            {new Date(booking.startTime).toLocaleDateString()} at {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {' - '}
                            {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                        <p className="text-xs mt-1">Host: {booking.hostName}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default StationDetails;
