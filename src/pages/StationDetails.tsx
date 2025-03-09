
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRadio } from "@/contexts/RadioContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Radio, 
  Play, 
  Calendar, 
  Users, 
  Music, 
  Clock, 
  CheckCircle2,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isAfter, isBefore } from "date-fns";

const StationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getStationById, getBookingsForStation, setCurrentPlayingStation, currentPlayingStation } = useRadio();
  const { toast } = useToast();
  
  const [station, setStation] = useState<any>(null);
  const [stationBookings, setStationBookings] = useState<any[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  
  useEffect(() => {
    if (!id) {
      navigate("/stations");
      return;
    }
    
    const stationData = getStationById(id);
    if (!stationData) {
      toast({
        title: "Station not found",
        description: "The radio station you're looking for doesn't exist.",
        variant: "destructive"
      });
      navigate("/stations");
      return;
    }
    
    setStation(stationData);
    setIsPlaying(currentPlayingStation === id);
    
    // Get approved bookings
    const bookings = getBookingsForStation(id).filter(booking => booking.approved);
    setStationBookings(bookings);
  }, [id, navigate, toast, getStationById, getBookingsForStation, currentPlayingStation]);
  
  const handlePlayToggle = () => {
    if (isPlaying) {
      setCurrentPlayingStation(null);
    } else {
      setCurrentPlayingStation(id!);
    }
    setIsPlaying(!isPlaying);
  };
  
  const getCurrentShow = () => {
    const now = new Date();
    return stationBookings.find(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      return isAfter(now, startTime) && isBefore(now, endTime);
    });
  };
  
  const upcomingShows = () => {
    const now = new Date();
    return stationBookings
      .filter(booking => isAfter(new Date(booking.startTime), now))
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };
  
  if (!station) {
    return (
      <MainLayout>
        <div className="container mx-auto py-8">
          <div className="text-center">Loading...</div>
        </div>
      </MainLayout>
    );
  }
  
  const currentShow = getCurrentShow();
  const upcoming = upcomingShows();
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <Link to="/stations" className="flex items-center text-gray-600 hover:text-black mb-6">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Stations
        </Link>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="relative aspect-video rounded-lg overflow-hidden mb-6">
              <img 
                src={station.image} 
                alt={station.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <div className="flex justify-between items-end">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1">{station.name}</h1>
                    <div className="flex items-center text-white/90 mb-3">
                      <Badge className="bg-blue mr-2">{station.genre}</Badge>
                      <div className="flex items-center text-sm">
                        <Users className="w-4 h-4 mr-1" />
                        {station.listeners} listeners
                      </div>
                    </div>
                    <p className="text-white/80 max-w-xl">{station.description}</p>
                  </div>
                  
                  <Button
                    onClick={handlePlayToggle}
                    className={cn(
                      "rounded-full h-16 w-16 flex items-center justify-center",
                      isPlaying ? "bg-red-500 hover:bg-red-600" : "bg-blue hover:bg-blue-dark"
                    )}
                  >
                    <Play className={cn("w-8 h-8", isPlaying ? "" : "ml-1")} />
                  </Button>
                </div>
              </div>
              
              {currentShow && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center text-sm font-medium">
                  <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
                  LIVE NOW
                </div>
              )}
            </div>
            
            {currentShow ? (
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-center mb-2">
                  <Radio className="w-5 h-5 text-red-500 mr-2" />
                  <h2 className="text-lg font-medium">Now Playing</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-xl">{currentShow.title}</h3>
                    <p className="text-gray-600">Hosted by {currentShow.hostName}</p>
                  </div>
                  <div className="flex items-center justify-end">
                    <Clock className="w-4 h-4 text-gray-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(currentShow.startTime), "h:mm a")} - {format(new Date(currentShow.endTime), "h:mm a")}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-6 text-center">
                <Music className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600">No live show at the moment. Regular programming is playing.</p>
              </div>
            )}
            
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Upcoming Shows</h2>
                {user?.isRadioHost && (
                  <Button 
                    onClick={() => navigate(`/book-show/${station.id}`)}
                    variant="outline" 
                    className="text-blue border-blue hover:bg-blue/10"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book a Show
                  </Button>
                )}
              </div>
              
              {upcoming.length > 0 ? (
                <div className="space-y-3">
                  {upcoming.slice(0, 5).map((show) => (
                    <div key={show.id} className="border border-gray-100 bg-white rounded-lg p-4 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-lg">{show.title}</h3>
                          <p className="text-gray-600">Hosted by {show.hostName}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-1" />
                            <span>{format(new Date(show.startTime), "MMMM d, yyyy")}</span>
                            <Clock className="w-4 h-4 ml-3 mr-1" />
                            <span>{format(new Date(show.startTime), "h:mm a")} - {format(new Date(show.endTime), "h:mm a")}</span>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100">
                  <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No upcoming shows scheduled yet.</p>
                  {user?.isRadioHost && (
                    <Button 
                      onClick={() => navigate(`/book-show/${station.id}`)}
                      variant="outline" 
                      className="mt-3 text-blue border-blue hover:bg-blue/10"
                    >
                      Book a Show
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg border border-gray-100 p-5 mb-6">
              <h2 className="text-lg font-semibold mb-4">About This Station</h2>
              <p className="text-gray-600 mb-4">{station.description}</p>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <Music className="w-5 h-5 mr-3 text-blue" />
                  <span>Genre: {station.genre}</span>
                </div>
                <div className="flex items-center text-gray-700">
                  <Users className="w-5 h-5 mr-3 text-blue" />
                  <span>{station.listeners} active listeners</span>
                </div>
              </div>
            </div>
            
            {user?.isRadioHost ? (
              <div className="bg-blue-50 rounded-lg border border-blue-100 p-5">
                <h2 className="text-lg font-semibold mb-3 text-blue-800">Radio Host Options</h2>
                <p className="text-blue-700 text-sm mb-4">As a verified radio host, you can book shows and go live on this station.</p>
                
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate(`/book-show/${station.id}`)}
                    className="w-full bg-white text-blue border-blue hover:bg-blue/10"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book a Show
                  </Button>
                  
                  <Button 
                    onClick={() => navigate('/go-live')}
                    className="w-full bg-blue hover:bg-blue-dark"
                  >
                    <Radio className="w-4 h-4 mr-2" />
                    Go Live Now
                  </Button>
                </div>
              </div>
            ) : isAuthenticated ? (
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-5 text-center">
                <Radio className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <h3 className="font-medium mb-2">Want to become a radio host?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Host your own radio shows and share your passion for music.
                </p>
                <Button 
                  className="bg-blue hover:bg-blue-dark"
                  onClick={() => {
                    toast({
                      title: "Feature coming soon",
                      description: "The ability to apply for radio host status will be available soon.",
                    });
                  }}
                >
                  Apply to be a Host
                </Button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg border border-gray-100 p-5 text-center">
                <h3 className="font-medium mb-2">Sign in to interact</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Login or register to book shows and interact with the community.
                </p>
                <Button 
                  className="bg-blue hover:bg-blue-dark"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default StationDetails;
