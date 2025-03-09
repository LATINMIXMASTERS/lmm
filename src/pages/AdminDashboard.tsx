
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRadio } from "@/contexts/RadioContext";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Radio, 
  Settings, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Shield 
} from "lucide-react";
import { format } from "date-fns";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { stations, bookings, updateStreamDetails, approveBooking } = useRadio();
  const { toast } = useToast();
  
  const [stationSettings, setStationSettings] = useState<Record<string, {
    url: string;
    port: string;
    password: string;
  }>>({});
  
  useEffect(() => {
    // Redirect if not an admin
    if (!isAuthenticated || !user?.isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to access this page.",
        variant: "destructive"
      });
      navigate("/login");
    }
    
    // Initialize station settings from existing data
    const initialSettings: Record<string, {url: string; port: string; password: string}> = {};
    
    stations.forEach(station => {
      initialSettings[station.id] = {
        url: station.streamDetails?.url || '',
        port: station.streamDetails?.port || '',
        password: station.streamDetails?.password || ''
      };
    });
    
    setStationSettings(initialSettings);
  }, [isAuthenticated, user, navigate, toast, stations]);
  
  const handleSettingChange = (stationId: string, field: 'url' | 'port' | 'password', value: string) => {
    setStationSettings(prev => ({
      ...prev,
      [stationId]: {
        ...prev[stationId],
        [field]: value
      }
    }));
  };
  
  const handleSaveStreamSettings = (stationId: string) => {
    const settings = stationSettings[stationId];
    
    if (!settings.url || !settings.port || !settings.password) {
      toast({
        title: "Validation Error",
        description: "All stream settings fields are required.",
        variant: "destructive"
      });
      return;
    }
    
    updateStreamDetails(stationId, settings);
    
    toast({
      title: "Settings Updated",
      description: "Stream settings have been updated successfully."
    });
  };
  
  const handleApproveBooking = (bookingId: string) => {
    approveBooking(bookingId);
    
    toast({
      title: "Booking Approved",
      description: "The show has been scheduled and the host notified."
    });
  };
  
  const pendingBookings = bookings.filter(booking => !booking.approved);
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Shield className="text-blue mr-2" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        
        <Tabs defaultValue="stations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stations" className="flex items-center">
              <Radio className="w-4 h-4 mr-2" />
              Manage Stations
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Show Bookings
              {pendingBookings.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stations">
            <div className="grid grid-cols-1 gap-6">
              {stations.map((station) => (
                <Card key={station.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center">
                      <Radio className="w-5 h-5 mr-2 text-blue" />
                      {station.name}
                    </CardTitle>
                    <CardDescription>{station.genre} • {station.listeners} listeners</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-blue-50 rounded-md p-3 mb-4 flex items-start">
                      <Lock className="w-5 h-5 text-blue mr-2 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        These streaming details are only visible to admins and will be provided to verified radio hosts when they go live.
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`url-${station.id}`} className="mb-2 block">
                          Stream URL
                        </Label>
                        <Input
                          id={`url-${station.id}`}
                          value={stationSettings[station.id]?.url || ''}
                          onChange={(e) => handleSettingChange(station.id, 'url', e.target.value)}
                          placeholder="e.g., stream.yourserver.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`port-${station.id}`} className="mb-2 block">
                          Port
                        </Label>
                        <Input
                          id={`port-${station.id}`}
                          value={stationSettings[station.id]?.port || ''}
                          onChange={(e) => handleSettingChange(station.id, 'port', e.target.value)}
                          placeholder="e.g., 8000"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`password-${station.id}`} className="mb-2 block">
                          Stream Password
                        </Label>
                        <Input
                          id={`password-${station.id}`}
                          type="password"
                          value={stationSettings[station.id]?.password || ''}
                          onChange={(e) => handleSettingChange(station.id, 'password', e.target.value)}
                          placeholder="Password"
                        />
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleSaveStreamSettings(station.id)}
                      className="bg-blue hover:bg-blue-dark"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Save Stream Settings
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approval</CardTitle>
                <CardDescription>
                  Review and approve show booking requests from radio hosts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => {
                      const station = stations.find(s => s.id === booking.stationId);
                      return (
                        <div key={booking.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{booking.title}</h3>
                              <p className="text-sm text-gray-600 mb-1">
                                Host: {booking.hostName} • Station: {station?.name}
                              </p>
                              <p className="text-sm">
                                {format(new Date(booking.startTime), "MMMM d, yyyy - h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 border-red-200 hover:bg-red-50"
                              >
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button 
                                size="sm" 
                                className="bg-green-500 hover:bg-green-600"
                                onClick={() => handleApproveBooking(booking.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No pending booking requests at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Approved Shows</CardTitle>
                <CardDescription>
                  All upcoming approved radio shows
                </CardDescription>
              </CardHeader>
              <CardContent>
                {bookings.filter(b => b.approved).length > 0 ? (
                  <div className="space-y-3">
                    {bookings
                      .filter(b => b.approved)
                      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                      .map((booking) => {
                        const station = stations.find(s => s.id === booking.stationId);
                        return (
                          <div key={booking.id} className="border border-green-200 bg-green-50 rounded-md p-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium">{booking.title}</h3>
                                <p className="text-sm text-gray-600 mb-1">
                                  Host: {booking.hostName} • Station: {station?.name}
                                </p>
                                <p className="text-sm">
                                  {format(new Date(booking.startTime), "MMMM d, yyyy - h:mm a")} to {format(new Date(booking.endTime), "h:mm a")}
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No approved shows yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
