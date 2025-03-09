
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Radio, Volume2, Settings, Video, Headphones, Tv, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/layout/MainLayout';
import { cn } from '@/lib/utils';

interface StreamSettings {
  stationName: string;
  genre: string;
  description: string;
  isPublic: boolean;
}

const GoLive: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAnimated, setIsAnimated] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [streamSettings, setStreamSettings] = useState<StreamSettings>({
    stationName: user?.username ? `${user.username}'s Station` : 'My Radio Station',
    genre: 'Electronic',
    description: 'Broadcasting live music and good vibes!',
    isPublic: true
  });
  const [deviceStatus, setDeviceStatus] = useState({
    audio: 'pending',
    video: 'disabled',
    connected: false
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to access this feature",
        variant: "destructive"
      });
      navigate('/login');
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
  }, [isAuthenticated, navigate, toast]);

  const requestAudioAccess = async () => {
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
    if (!deviceStatus.connected) {
      toast({
        title: "Cannot start streaming",
        description: "Please connect your audio device first",
        variant: "destructive"
      });
      return;
    }
    
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.start(1000); // Collect data each second
      setIsLive(true);
      setShowSettings(false);
      
      toast({
        title: "You're live!",
        description: `Broadcasting ${streamSettings.stationName}`
      });
    }
  };
  
  const handleStopStream = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsLive(false);
      
      // In a real app, we would notify the server that the stream has ended
      
      toast({
        title: "Stream ended",
        description: "Your broadcast has ended successfully."
      });
    }
  };
  
  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setStreamSettings({
      ...streamSettings,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    });
  };

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
            `Broadcasting to listeners worldwide as "${streamSettings.stationName}"` : 
            'Set up your radio station and start streaming to listeners around the world.'
          }
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Stream preview/controls */}
          <div 
            className={cn(
              "md:col-span-2 bg-white border border-gray-lightest rounded-xl shadow-sm overflow-hidden",
              !isAnimated ? "opacity-0" : "animate-fade-in"
            )}
            style={{ animationDelay: "0.3s" }}
          >
            <div className="p-4 md:p-6">
              {/* Stream status */}
              <div className={cn("relative aspect-video bg-gray-900 rounded-lg mb-6", isLive ? "border-2 border-red-500" : "")}>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                  {isLive ? (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="animate-ping absolute h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative rounded-full h-3 w-3 bg-red-500"></span>
                      </div>
                      <h3 className="text-2xl font-bold mb-2">{streamSettings.stationName}</h3>
                      <p className="text-gray-300 mb-1">{streamSettings.genre}</p>
                      <p className="text-gray-400 text-sm">Broadcasting live</p>
                    </>
                  ) : (
                    <>
                      <Radio className="w-10 h-10 mb-4 text-gray-400" />
                      <h3 className="text-xl font-bold mb-2">Not Broadcasting</h3>
                      <p className="text-gray-400 text-sm">Connect your devices to get started</p>
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
                    disabled={deviceStatus.audio === 'connected'}
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
                  
                  <button 
                    className="py-2 px-4 bg-gray-light text-gray-dark rounded-lg flex items-center space-x-2 text-sm font-medium hover:bg-gray-200 transition-colors"
                    onClick={() => setShowSettings(!showSettings)}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
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
                      disabled={!deviceStatus.connected}
                    >
                      <Radio className="w-4 h-4" />
                      <span>Go Live</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings panel */}
          <div 
            className={cn(
              "bg-white border border-gray-lightest rounded-xl shadow-sm overflow-hidden transition-all duration-300",
              !isAnimated ? "opacity-0" : "animate-fade-in",
              !showSettings && "md:hidden"
            )}
            style={{ animationDelay: "0.4s" }}
          >
            <div className="p-4 md:p-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <Settings className="w-4 h-4 mr-2" />
                Stream Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="stationName" className="block text-sm font-medium text-gray-dark mb-1">
                    Station Name
                  </label>
                  <input 
                    type="text"
                    id="stationName"
                    name="stationName"
                    value={streamSettings.stationName}
                    onChange={handleSettingChange}
                    disabled={isLive}
                    className="w-full px-3 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-blue/20 focus:border-blue disabled:bg-gray-lightest disabled:text-gray"
                  />
                </div>
                
                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-dark mb-1">
                    Genre
                  </label>
                  <select
                    id="genre"
                    name="genre"
                    value={streamSettings.genre}
                    onChange={handleSettingChange}
                    disabled={isLive}
                    className="w-full px-3 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-blue/20 focus:border-blue disabled:bg-gray-lightest disabled:text-gray"
                  >
                    <option value="Electronic">Electronic</option>
                    <option value="Hip-Hop">Hip-Hop</option>
                    <option value="Pop">Pop</option>
                    <option value="Rock">Rock</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Reggae">Reggae</option>
                    <option value="Country">Country</option>
                    <option value="Metal">Metal</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-dark mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={streamSettings.description}
                    onChange={handleSettingChange}
                    disabled={isLive}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-light rounded-lg focus:ring-2 focus:ring-blue/20 focus:border-blue disabled:bg-gray-lightest disabled:text-gray"
                  />
                </div>
                
                <div className="pt-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      checked={streamSettings.isPublic}
                      onChange={handleSettingChange}
                      disabled={isLive}
                      className="w-4 h-4 text-blue focus:ring-blue/20 border-gray-light rounded"
                    />
                    <span className="ml-2 text-sm text-gray-dark">Public station (visible to all)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        
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
            Device Status
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 border border-gray-lightest rounded-lg">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center",
                deviceStatus.audio === 'connected' ? "bg-green-500/10 text-green-500" : 
                deviceStatus.audio === 'error' ? "bg-red-500/10 text-red-500" : 
                "bg-blue/10 text-blue"
              )}>
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Audio Input</div>
                <div className="text-sm text-gray">
                  {deviceStatus.audio === 'connected' ? (
                    <span className="flex items-center text-green-500">
                      <Check className="w-3 h-3 mr-1" /> Connected
                    </span>
                  ) : deviceStatus.audio === 'error' ? (
                    <span className="flex items-center text-red-500">
                      <X className="w-3 h-3 mr-1" /> Error
                    </span>
                  ) : (
                    <span>Not connected</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 border border-gray-lightest rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-lightest flex items-center justify-center text-gray">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <div className="font-medium">Audio Output</div>
                <div className="text-sm text-gray">
                  {isLive ? (
                    <span className="flex items-center text-green-500">
                      <Check className="w-3 h-3 mr-1" /> Streaming
                    </span>
                  ) : (
                    <span>Ready</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GoLive;
