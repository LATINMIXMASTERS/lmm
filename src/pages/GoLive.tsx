
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Radio, Volume2, Settings, Headphones, Check, X, Calendar, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/contexts/RadioContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layout/MainLayout';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isAfter, isBefore } from 'date-fns';

const GoLive: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { stations, bookings } = useRadio();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAnimated, setIsAnimated] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({
    audio: 'pending',
    connected: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  
  // Redirect if not authenticated or not a radio host
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to access this feature",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }

    if (!user?.isRadioHost) {
      toast({
        title: "Permission denied",
        description: "Only verified radio hosts can go live",
        variant: "destructive"
      });
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Clean up media resources
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isAuthenticated, user, navigate, toast]);

  // Find eligible stations for this host
  const getEligibleStations = () => {
    if (!user) return [];
    
    // Admin can go live on any station
    if (user.isAdmin) return stations;
    
    const now = new Date();
    
    // Find stations where this host has a current or upcoming (within 15 mins) booking
    return stations.filter(station => {
      const hostBookings = bookings.filter(booking => 
        booking.approved && 
        booking.hostId === user.id && 
        booking.stationId === station.id
      );
      
      // Check if there's a current booking for this host
      const currentBooking = hostBookings.find(booking => {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        
        // Current time is between start and end
        if (isAfter(now, startTime) && isBefore(now, endTime)) {
          return true;
        }
        
        // Or starts within the next 15 minutes
        const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60000);
        if (isAfter(startTime, now) && isBefore(startTime, fifteenMinutesFromNow)) {
          return true;
        }
        
        return false;
      });
      
      return !!currentBooking;
    });
  };

  const eligibleStations = getEligibleStations();
  
  const getCurrentBooking = () => {
    if (!user || !selectedStation) return null;
    
    const now = new Date();
    const stationBookings = bookings.filter(booking => 
      booking.approved && 
      booking.hostId === user.id && 
      booking.stationId === selectedStation
    );
    
    return stationBookings.find(booking => {
      const startTime = new Date(booking.startTime);
      const endTime = new Date(booking.endTime);
      return isAfter(now, startTime) && isBefore(now, endTime);
    });
  };
  
  // Get stream details for the selected station
  const getStreamDetails = () => {
    if (!selectedStation || !user?.isRadioHost) return null;
    
    const station = stations.find(s => s.id === selectedStation);
    if (!station?.streamDetails) return null;
    
    return station.streamDetails;
  };

  const requestAudioAccess = async () => {
    if (!selectedStation) {
      toast({
        title: "Select a station",
        description: "Please select a radio station before connecting your microphone.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setDeviceStatus({...deviceStatus, audio: 'pending'});
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      
      audioStreamRef.current = stream;
      
      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      // Set up recording
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          // In a real application, we would send this data to a server
          console.log('Audio data available', event.data.size);
        }
      };
      
      setDeviceStatus({
        ...deviceStatus,
        audio: 'connected',
        connected: true
      });
      
      toast({
        title: "Microphone connected",
        description: "Your audio device is ready to stream"
      });
      
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setDeviceStatus({
        ...deviceStatus,
        audio: 'error'
      });
      
      toast({
        title: "Device access error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStartStream = () => {
    if (!selectedStation) {
      toast({
        title: "Select a station",
        description: "Please select a radio station before going live.",
        variant: "destructive"
      });
      return;
    }
    
    if (!deviceStatus.connected) {
      toast({
        title: "Cannot start streaming",
        description: "Please connect your audio device first",
        variant: "destructive"
      });
      return;
    }
    
    const streamDetails = getStreamDetails();
    if (!streamDetails) {
      toast({
        title: "Stream configuration missing",
        description: "This station doesn't have proper stream settings configured.",
        variant: "destructive"
      });
      return;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start(1000); // Collect data each second
      setIsLive(true);
      
      toast({
        title: "You're live!",
        description: `Broadcasting on ${stations.find(s => s.id === selectedStation)?.name}`
      });
    }
  };
  
  const handleStopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsLive(false);
      
      toast({
        title: "Stream ended",
        description: "Your broadcast has ended successfully."
      });
    }
  };

  const currentBooking = getCurrentBooking();
  const streamDetails = getStreamDetails();
  
  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto mt-8 mb-16 px-4">
        <div 
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-medium mb-4",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
        >
          <Radio className="w-3 h-3 mr-1" />
          Broadcaster Studio
        </div>
        
        <h1 
          className={cn(
            "text-3xl md:text-4xl font-bold mb-2",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.1s" }}
        >
          {isLive ? 'You\'re Live!' : 'Start Broadcasting'}
        </h1>
        
        <p 
          className={cn(
            "text-gray-dark mb-8",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          {isLive ? 
            `Broadcasting to listeners worldwide on ${stations.find(s => s.id === selectedStation)?.name}` : 
            'Connect your microphone and start streaming to listeners around the world.'
          }
        </p>
        
        {eligibleStations.length === 0 ? (
          <Card 
            className={cn(
              "border-yellow-200 bg-yellow-50", 
              !isAnimated ? "opacity-0" : "animate-fade-in"
            )}
            style={{ animationDelay: "0.3s" }}
          >
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-yellow-600" />
                No Scheduled Shows
              </CardTitle>
              <CardDescription className="text-yellow-700">
                You don't have any approved shows scheduled right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                To go live, you need to have a scheduled show that's either currently happening or starts within the next 15 minutes.
              </p>
              <Button 
                onClick={() => navigate('/stations')}
                className="bg-blue hover:bg-blue-dark"
              >
                Book a Show
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {/* Stream controls */}
            <div 
              className={cn(
                "md:col-span-2 bg-white border border-gray-lightest rounded-xl shadow-sm overflow-hidden",
                !isAnimated ? "opacity-0" : "animate-fade-in"
              )}
              style={{ animationDelay: "0.3s" }}
            >
              <div className="p-4 md:p-6">
                {/* Station selector */}
                {!isLive && (
                  <div className="mb-6">
                    <h2 className="text-lg font-medium mb-3">Select Station to Broadcast</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {eligibleStations.map(station => (
                        <div 
                          key={station.id}
                          onClick={() => setSelectedStation(station.id)}
                          className={cn(
                            "border rounded-md p-3 cursor-pointer transition-all",
                            selectedStation === station.id 
                              ? "border-blue bg-blue-50 shadow-sm" 
                              : "border-gray-100 hover:border-gray-200"
                          )}
                        >
                          <div className="flex items-center">
                            <div 
                              className="w-10 h-10 rounded-md bg-cover bg-center mr-3 flex-shrink-0" 
                              style={{ backgroundImage: `url(${station.image})` }}
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">{station.name}</h3>
                              <p className="text-xs text-gray-500 truncate">{station.genre}</p>
                            </div>
                            {selectedStation === station.id && (
                              <Check className="w-5 h-5 text-blue ml-2" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Stream preview */}
                <div className={cn("relative aspect-video bg-gray-900 rounded-lg mb-6", isLive ? "border-2 border-red-500" : "")}>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                    {isLive ? (
                      <>
                        <div className="flex items-center justify-center mb-4">
                          <span className="animate-ping absolute h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">
                          {stations.find(s => s.id === selectedStation)?.name}
                        </h3>
                        <p className="text-gray-300 mb-1">
                          {currentBooking?.title || "Live Stream"}
                        </p>
                        <p className="text-gray-400 text-sm">Broadcasting live</p>
                      </>
                    ) : (
                      <>
                        <Radio className="w-10 h-10 mb-4 text-gray-400" />
                        <h3 className="text-xl font-bold mb-2">Not Broadcasting</h3>
                        <p className="text-gray-400 text-sm">
                          {selectedStation 
                            ? "Connect your microphone to get started" 
                            : "Select a station to begin"}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Live badge */}
                  {isLive && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded flex items-center">
                      <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-pulse"></span>
                      LIVE
                    </div>
                  )}
                </div>
                
                {/* Controls */}
                <div className="flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    <button 
                      className={cn(
                        "py-2 px-4 rounded-lg flex items-center space-x-2 text-sm font-medium",
                        deviceStatus.audio === 'connected'
                          ? "bg-green-500 text-white hover:bg-green-600"
                          : deviceStatus.audio === 'error'
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "bg-blue text-white hover:bg-blue-dark"
                      )}
                      onClick={requestAudioAccess}
                      disabled={deviceStatus.audio === 'connected' || !selectedStation}
                    >
                      <Mic className="w-4 h-4" />
                      <span>
                        {deviceStatus.audio === 'connected' 
                          ? 'Mic Connected' 
                          : deviceStatus.audio === 'error'
                            ? 'Mic Error'
                            : 'Connect Mic'}
                      </span>
                    </button>
                  </div>
                  
                  <div>
                    {isLive ? (
                      <button 
                        className="py-2 px-6 bg-red-500 text-white rounded-lg flex items-center space-x-2 font-medium hover:bg-red-600 transition-colors"
                        onClick={handleStopStream}
                      >
                        <X className="w-4 h-4" />
                        <span>End Stream</span>
                      </button>
                    ) : (
                      <button 
                        className="py-2 px-6 bg-red-500 text-white rounded-lg flex items-center space-x-2 font-medium hover:bg-red-600 transition-colors"
                        onClick={handleStartStream}
                        disabled={!deviceStatus.connected || !selectedStation}
                      >
                        <Radio className="w-4 h-4" />
                        <span>Go Live</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stream info */}
            <div 
              className={cn(
                "bg-white border border-gray-lightest rounded-xl shadow-sm overflow-hidden",
                !isAnimated ? "opacity-0" : "animate-fade-in"
              )}
              style={{ animationDelay: "0.4s" }}
            >
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-medium mb-4 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Stream Information
                </h3>
                
                {currentBooking ? (
                  <div className="mb-6">
                    <div className="bg-green-50 border border-green-100 rounded-md p-3 mb-4">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-4 h-4 text-green-600 mr-1" />
                        <h4 className="font-medium text-green-800">Current Show</h4>
                      </div>
                      <p className="text-lg font-medium">{currentBooking.title}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {format(new Date(currentBooking.startTime), "h:mm a")} - {format(new Date(currentBooking.endTime), "h:mm a")}
                      </p>
                    </div>
                  </div>
                ) : selectedStation ? (
                  <div className="mb-6">
                    <div className="bg-yellow-50 border border-yellow-100 rounded-md p-3">
                      <p className="text-yellow-800 text-sm">
                        You're starting an unscheduled broadcast. If you have an upcoming show, it will automatically connect to that timeslot.
                      </p>
                    </div>
                  </div>
                ) : null}
                
                {selectedStation && streamDetails ? (
                  <>
                    <h4 className="font-medium mb-2">Stream Connection Details</h4>
                    <div className="space-y-3 mb-6">
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-500">Stream URL</div>
                        <div>{streamDetails.url}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-500">Port</div>
                        <div>{streamDetails.port}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-md">
                        <div className="text-sm font-medium text-gray-500">Password</div>
                        <div>••••••••</div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-3">
                      <p className="text-blue-800 text-sm">
                        You can use these settings to connect with external broadcasting software like VirtualDJ, OBS, or other Shoutcast-compatible software.
                      </p>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}
        
        {/* Connection info */}
        <div 
          className={cn(
            "mt-8 bg-white border border-gray-lightest rounded-xl p-4 md:p-6",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
          style={{ animationDelay: "0.5s" }}
        >
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Headphones className="w-4 h-4 mr-2" />
            Broadcasting Tips
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue/10 text-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">Quality Audio</h4>
                <p className="text-sm text-gray-600">Use a good microphone in a quiet environment for the best sound quality.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue/10 text-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">Be Consistent</h4>
                <p className="text-sm text-gray-600">Stick to your scheduled time slots to build a regular audience.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-blue/10 text-blue flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-medium">Engage Your Audience</h4>
                <p className="text-sm text-gray-600">Interact with listeners and make announcements between tracks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GoLive;
