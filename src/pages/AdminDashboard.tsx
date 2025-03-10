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
  Shield,
  Users,
  UserCheck,
  UserX,
  Calendar as CalendarIcon,
  Trash,
  UserPen,
  Ban,
  User,
  ShieldOff,
  Search,
  Volume2
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UserEditDialog from "@/components/UserEditDialog";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    user, 
    isAuthenticated, 
    users, 
    approveUser, 
    rejectUser, 
    suspendUser, 
    activateUser, 
    editUser, 
    deleteUser 
  } = useAuth();
  const { stations, bookings, updateStreamDetails, approveBooking } = useRadio();
  const { toast } = useToast();
  
  const [stationSettings, setStationSettings] = useState<Record<string, {
    url: string;
    port: string;
    password: string;
  }>>({});
  
  const [userSearch, setUserSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
  
  const [streamUrls, setStreamUrls] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to access this page.",
        variant: "destructive"
      });
      navigate("/login");
    }
    
    const initialSettings: Record<string, {url: string; port: string; password: string}> = {};
    const initialStreamUrls: Record<string, string> = {};
    
    stations.forEach(station => {
      initialSettings[station.id] = {
        url: station.streamDetails?.url || '',
        port: station.streamDetails?.port || '',
        password: station.streamDetails?.password || ''
      };
      
      initialStreamUrls[station.id] = station.streamDetails?.url || '';
    });
    
    setStationSettings(initialSettings);
    setStreamUrls(initialStreamUrls);
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
    
    let formattedUrl = settings.url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    updateStreamDetails(stationId, {
      ...settings,
      url: formattedUrl
    });
    
    setStreamUrls(prev => ({
      ...prev,
      [stationId]: formattedUrl
    }));
    
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

  const handleApproveUser = (userId: string) => {
    approveUser(userId);
  };

  const handleRejectUser = (userId: string) => {
    rejectUser(userId);
  };

  const handleOpenEditDialog = (userData: any) => {
    setEditingUser(userData);
    setShowEditDialog(true);
  };

  const handleSaveUserEdit = (userId: string, userData: any) => {
    editUser(userId, userData);
    setShowEditDialog(false);
  };

  const handleToggleSuspend = (userData: any) => {
    if (userData.suspended) {
      activateUser(userData.id);
    } else {
      suspendUser(userData.id);
    }
  };

  const handleConfirmDelete = (userId: string) => {
    setShowConfirmDelete(null);
    deleteUser(userId);
  };
  
  const pendingBookings = bookings.filter(booking => !booking.approved);
  const pendingUsers = users.filter(u => u.pendingApproval);
  
  const filteredUsers = users
    .filter(u => !u.pendingApproval)
    .filter(u => {
      if (!userSearch) return true;
      const search = userSearch.toLowerCase();
      return (
        u.username.toLowerCase().includes(search) || 
        u.email.toLowerCase().includes(search)
      );
    });
  
  const handleStreamUrlChange = (stationId: string, url: string) => {
    setStreamUrls(prev => ({
      ...prev,
      [stationId]: url
    }));
  };
  
  const handleSaveStreamUrl = (stationId: string) => {
    const url = streamUrls[stationId];
    
    if (!url) {
      toast({
        title: "Validation Error",
        description: "Stream URL is required.",
        variant: "destructive"
      });
      return;
    }
    
    let formattedUrl = url;
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }
    
    useRadio().updateStreamUrl(stationId, formattedUrl);
    
    toast({
      title: "Stream URL Updated",
      description: "The streaming URL has been updated successfully."
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center mb-6">
          <Shield className="text-blue mr-2" />
          <h1 className="text-2xl font-bold">LATINMIXMASTERS Admin Dashboard</h1>
        </div>
        
        <Tabs defaultValue="stations" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="stations" className="flex items-center">
              <Radio className="w-4 h-4 mr-2" />
              Manage Stations
            </TabsTrigger>
            <TabsTrigger value="streaming" className="flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Stream URLs
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
              {pendingUsers.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
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
          
          <TabsContent value="streaming">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="w-5 h-5 mr-2 text-blue" />
                    Streaming URLs
                  </CardTitle>
                  <CardDescription>
                    Manage the streaming URLs for each radio station
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {stations.map((station) => (
                      <div key={station.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-lg">{station.name}</h3>
                          <span className="text-sm text-gray-500">{station.genre}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div className="md:col-span-3">
                            <Label htmlFor={`stream-url-${station.id}`} className="mb-2 block">
                              Stream URL
                            </Label>
                            <Input
                              id={`stream-url-${station.id}`}
                              value={streamUrls[station.id] || ''}
                              onChange={(e) => handleStreamUrlChange(station.id, e.target.value)}
                              placeholder="e.g., https://stream.server.com/station"
                              className="w-full"
                            />
                          </div>
                          <Button 
                            onClick={() => handleSaveStreamUrl(station.id)}
                            className="bg-blue hover:bg-blue-dark"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Save URL
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Pending User Approvals</CardTitle>
                <CardDescription>
                  Review and approve user registration requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {pendingUsers.length > 0 ? (
                  <div className="space-y-4">
                    {pendingUsers.map((pendingUser) => (
                      <div key={pendingUser.id} className="border border-yellow-200 bg-yellow-50 rounded-md p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{pendingUser.username}</h3>
                            <p className="text-sm text-gray-600">
                              Email: {pendingUser.email}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Registered {formatDistance(new Date(pendingUser.registeredAt || Date.now()), new Date(), { addSuffix: true })}
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 border-red-200 hover:bg-red-50"
                              onClick={() => handleRejectUser(pendingUser.id)}
                            >
                              <UserX className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button 
                              size="sm" 
                              className="bg-green-500 hover:bg-green-600"
                              onClick={() => handleApproveUser(pendingUser.id)}
                            >
                              <UserCheck className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No pending user approvals at this time.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Manage all users in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex mb-4">
                  <div className="relative flex-grow">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search by username or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {filteredUsers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredUsers.map((userData) => (
                      <div key={userData.id} className={`border rounded-md p-3 ${
                        userData.suspended ? 'border-red-200 bg-red-50' :
                        userData.isAdmin ? 'border-blue-200 bg-blue-50' :
                        userData.isRadioHost ? 'border-green-200 bg-green-50' :
                        'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              <h3 className="font-medium">{userData.username}</h3>
                              {userData.isAdmin && (
                                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded">
                                  Admin
                                </span>
                              )}
                              {userData.isRadioHost && !userData.isAdmin && (
                                <span className="bg-green-100 text-green-800 text-xs px-1.5 py-0.5 rounded">
                                  Host
                                </span>
                              )}
                              {userData.suspended && (
                                <span className="bg-red-100 text-red-800 text-xs px-1.5 py-0.5 rounded">
                                  Suspended
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {userData.email}
                            </p>
                            {userData.registeredAt && (
                              <p className="text-xs text-gray-500 mt-1">
                                Member since {format(new Date(userData.registeredAt), "MMM d, yyyy")}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            {showConfirmDelete === userData.id ? (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setShowConfirmDelete(null)}
                                >
                                  Cancel
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => handleConfirmDelete(userData.id)}
                                >
                                  Confirm
                                </Button>
                              </>
                            ) : (
                              <>
                                {!userData.isAdmin && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className={userData.suspended ? 
                                      "border-green-200 text-green-700 hover:bg-green-50" : 
                                      "border-red-200 text-red-700 hover:bg-red-50"
                                    }
                                    onClick={() => handleToggleSuspend(userData)}
                                  >
                                    {userData.suspended ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-1" />
                                        Activate
                                      </>
                                    ) : (
                                      <>
                                        <Ban className="w-4 h-4 mr-1" />
                                        Suspend
                                      </>
                                    )}
                                  </Button>
                                )}
                                
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleOpenEditDialog(userData)}
                                >
                                  <UserPen className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                
                                {userData.id !== '1' && (
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                    onClick={() => setShowConfirmDelete(userData.id)}
                                  >
                                    <Trash className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <User className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No users found matching your search.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {editingUser && (
              <UserEditDialog
                user={editingUser}
                isOpen={showEditDialog}
                onClose={() => setShowEditDialog(false)}
                onSave={handleSaveUserEdit}
              />
            )}
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
