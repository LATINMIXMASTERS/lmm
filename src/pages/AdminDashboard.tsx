
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Settings } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
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
  User as UserIcon,
  ShieldOff,
  Search,
  Volume2,
  Mic,
  Music,
  ImageIcon,
  Upload,
  X
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import UserEditDialog from "@/components/UserEditDialog";
import { FileUpload } from "@/models/RadioStation";

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
  const { 
    stations, 
    bookings, 
    updateStreamDetails, 
    approveBooking, 
    updateStreamUrl,
    updateStationImage,
    uploadStationImage 
  } = useRadio();
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
  const [stationImages, setStationImages] = useState<Record<string, string>>({});
  const [stationImageUploads, setStationImageUploads] = useState<Record<string, FileUpload | null>>({});
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
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
    const initialStationImages: Record<string, string> = {};
    
    stations.forEach(station => {
      initialSettings[station.id] = {
        url: station.streamDetails?.url || '',
        port: station.streamDetails?.port || '',
        password: station.streamDetails?.password || ''
      };
      
      initialStreamUrls[station.id] = station.streamUrl || '';
      initialStationImages[station.id] = station.image || '';
    });
    
    setStationSettings(initialSettings);
    setStreamUrls(initialStreamUrls);
    setStationImages(initialStationImages);
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
    
    toast({
      title: "Settings Updated",
      description: "Stream settings for hosts have been updated successfully."
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
    
    updateStreamUrl(stationId, formattedUrl);
    
    toast({
      title: "Player Stream URL Updated",
      description: "The listener streaming URL has been updated successfully."
    });
  };

  const handleStationImageChange = (stationId: string, imageUrl: string) => {
    setStationImages(prev => ({
      ...prev,
      [stationId]: imageUrl
    }));
    
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
  };
  
  const handleStationImageFileChange = (stationId: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStationImageUploads(prev => ({
        ...prev,
        [stationId]: { file, dataUrl }
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleClearStationImageUpload = (stationId: string) => {
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
    
    if (fileInputRefs.current[stationId]) {
      fileInputRefs.current[stationId]!.value = '';
    }
  };

  const handleSaveStationImage = async (stationId: string) => {
    try {
      const upload = stationImageUploads[stationId];
      
      if (upload && upload.file) {
        await uploadStationImage(stationId, upload.file);
        
        toast({
          title: "Station Image Updated",
          description: "The station cover image has been uploaded successfully."
        });
        
        handleClearStationImageUpload(stationId);
      } else if (stationImages[stationId]) {
        const imageUrl = stationImages[stationId];
        
        if (!imageUrl) {
          toast({
            title: "Validation Error",
            description: "Image URL is required.",
            variant: "destructive"
          });
          return;
        }
        
        updateStationImage(stationId, imageUrl);
        
        toast({
          title: "Station Image Updated",
          description: "The station cover image has been updated successfully."
        });
      } else {
        toast({
          title: "No changes",
          description: "Please provide an image URL or upload a file.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update station image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const triggerFileInputClick = (stationId: string) => {
    if (fileInputRefs.current[stationId]) {
      fileInputRefs.current[stationId]!.click();
    }
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
              <Mic className="w-4 h-4 mr-2" />
              Host Streaming Setup
            </TabsTrigger>
            <TabsTrigger value="streaming" className="flex items-center">
              <Volume2 className="w-4 h-4 mr-2" />
              Player Stream URLs
            </TabsTrigger>
            <TabsTrigger value="station-images" className="flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" />
              Station Images
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
              {pendingUsers?.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingUsers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Show Bookings
              {pendingBookings?.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookings.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stations">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Mic className="w-5 h-5 mr-2 text-blue" />
                    Host Streaming Setup
                  </CardTitle>
                  <CardDescription>Configure the streaming settings for radio hosts to connect with their broadcasting software</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-md p-3 mb-4 flex items-start">
                    <Lock className="w-5 h-5 text-blue mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      These Shoutcast/Icecast streaming details are only visible to admins and will be provided to verified radio hosts when they go live.
                      <br />
                      <strong>Note:</strong> These settings are for hosts to <strong>broadcast</strong> to the server, not for listeners to connect.
                    </div>
                  </div>
                </CardContent>
              </Card>
              
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <Label htmlFor={`url-${station.id}`} className="mb-2 block">
                          Stream Server URL
                        </Label>
                        <Input
                          id={`url-${station.id}`}
                          value={stationSettings[station.id]?.url || ''}
                          onChange={(e) => handleSettingChange(station.id, 'url', e.target.value)}
                          placeholder="e.g., stream.yourserver.com"
                        />
                        <p className="text-xs text-gray-500 mt-1">The URL hosts will connect to for broadcasting</p>
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
                        <p className="text-xs text-gray-500 mt-1">The server port for Shoutcast/Icecast</p>
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
                        <p className="text-xs text-gray-500 mt-1">The password hosts need to authenticate</p>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => handleSaveStreamSettings(station.id)}
                      className="bg-blue hover:bg-blue-dark"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Save Host Streaming Settings
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
                    Player Streaming URLs
                  </CardTitle>
                  <CardDescription>
                    Configure the URLs that listeners and the player will use to connect to each station
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-md p-3 mb-6 flex items-start">
                    <Music className="w-5 h-5 text-blue mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      These are the public stream URLs that will be used by the player and listeners to tune in to each station. 
                      <br/>
                      <strong>Note:</strong> These should be the publicly accessible URLs for <strong>listening</strong>, not for broadcasting.
                    </div>
                  </div>
                
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
                              Public Stream URL
                            </Label>
                            <Input
                              id={`stream-url-${station.id}`}
                              value={streamUrls[station.id] || ''}
                              onChange={(e) => handleStreamUrlChange(station.id, e.target.value)}
                              placeholder="e.g., https://stream.server.com/station"
                              className="w-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">The URL listeners will use to hear this station</p>
                          </div>
                          <Button 
                            onClick={() => handleSaveStreamUrl(station.id)}
                            className="bg-blue hover:bg-blue-dark"
                          >
                            <Volume2 className="w-4 h-4 mr-2" />
                            Save Player URL
                          </Button>
                        </div>
                        
                        {station.streamUrl && (
                          <div className="mt-3 text-sm text-gray-600">
                            Current URL: <span className="font-mono bg-gray-100 p-1 rounded">{station.streamUrl}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="station-images">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ImageIcon className="w-5 h-5 mr-2 text-blue" />
                    Station Cover Images
                  </CardTitle>
                  <CardDescription>
                    Update the cover images for each radio station
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-md p-3 mb-6 flex items-start">
                    <ImageIcon className="w-5 h-5 text-blue mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      These images will be displayed on the stations page and in the player when the station is playing.
                      <br/>
                      <strong>Note:</strong> For best results, use high-quality images with a 16:9 aspect ratio. Maximum file size: 2MB.
                    </div>
                  </div>
                
                  <div className="space-y-6">
                    {stations.map((station) => (
                      <div key={station.id} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="font-medium text-lg">{station.name}</h3>
                          <span className="text-sm text-gray-500">{station.genre}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                          <div>
                            <div className="mb-4">
                              <Label className="mb-2 block">Image Upload</Label>
                              <div className="flex items-center gap-2">
                                <Button 
                                  type="button"
                                  variant="outline"
                                  onClick={() => triggerFileInputClick(station.id)}
                                  className="w-full flex justify-center py-6 border-dashed"
                                >
                                  <Upload className="w-5 h-5 mr-2" />
                                  Choose Image File
                                </Button>
                                <input
                                  type="file"
                                  id={`file-upload-${station.id}`}
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleStationImageFileChange(station.id, e.target.files)}
                                  ref={(el) => fileInputRefs.current[station.id] = el}
                                />
                              </div>
                            </div>
                            
                            {stationImageUploads[station.id] && (
                              <div className="mt-2 mb-4 flex items-center gap-2">
                                <div className="flex-1 bg-blue-50 rounded p-2 flex items-center">
                                  <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                                    <img 
                                      src={stationImageUploads[station.id]?.dataUrl} 
                                      alt="Preview" 
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-sm truncate">
                                    {stationImageUploads[station.id]?.file.name}
                                  </span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleClearStationImageUpload(station.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            
                            <div className="flex flex-col gap-2">
                              <Label htmlFor={`station-image-${station.id}`} className="mb-2 block">
                                Or Enter Image URL
                              </Label>
                              <Input
                                id={`station-image-${station.id}`}
                                value={stationImages[station.id] || ''}
                                onChange={(e) => handleStationImageChange(station.id, e.target.value)}
                                placeholder="https://example.com/image.jpg"
                                className="w-full"
                                disabled={!!stationImageUploads[station.id]}
                              />
                              <p className="text-xs text-gray-500">
                                {stationImageUploads[station.id] 
                                  ? "URL input is disabled while a file is selected for upload" 
                                  : "Enter a URL for the station cover image"}
                              </p>
                            </div>
                            
                            <Button 
                              onClick={() => handleSaveStationImage(station.id)}
                              className="mt-4 bg-blue hover:bg-blue-dark w-full"
                            >
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Save Image
                            </Button>
                          </div>
                          
                          <div className="bg-gray-100 rounded-md p-4 flex justify-center">
                            <div className="aspect-video w-full max-w-[300px] rounded overflow-hidden border">
                              {stationImageUploads[station.id]?.dataUrl ? (
                                <img 
                                  src={stationImageUploads[station.id]?.dataUrl} 
                                  alt={`${station.name} cover preview`}
                                  className="w-full h-full object-cover"
                                />
                              ) : stationImages[station.id] ? (
                                <img 
                                  src={stationImages[station.id]} 
                                  alt={`${station.name} cover`}
                                  className="w-full h-full object-cover"
                                />
                              ) : station.image ? (
                                <img 
                                  src={station.image} 
                                  alt={`${station.name} current cover`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                  <ImageIcon className="w-12 h-12 text-gray-400" />
                                </div>
                              )}
                            </div>
                          </div>
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
