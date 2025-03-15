
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Music, 
  BarChart2, 
  Upload, 
  MessageCircle, 
  Users, 
  Settings, 
  Radio, 
  PlusCircle,
  Calendar
} from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { useRadio } from '@/contexts/RadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { BookingSlot } from '@/models/RadioStation';
import { format } from 'date-fns';
import ProfileEditor from '@/components/ProfileEditor';

const HostDashboard: React.FC = () => {
  const { user } = useAuth();
  const { tracks, getTracksByUser, deleteTrack } = useTrack();
  const { stations, bookings } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [editingProfile, setEditingProfile] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }

  if (!user.isRadioHost) {
    navigate('/');
    return null;
  }

  const userTracks = getTracksByUser(user.id);
  const userStations = stations.filter(station => 
    station.hosts && station.hosts.includes(user.id)
  );
  
  const userBookings = bookings.filter(booking => 
    booking.hostId === user.id
  );

  const approvedBookings = userBookings.filter(booking => booking.approved);
  const pendingBookings = userBookings.filter(booking => !booking.approved && !booking.rejected);
  const rejectedBookings = userBookings.filter(booking => booking.rejected);

  const handleDeleteTrack = (trackId: string) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      const success = deleteTrack(trackId);
      if (success) {
        toast({
          title: "Track deleted",
          description: "Your track has been removed",
        });
      }
    }
  };

  const handleEditTrack = (trackId: string) => {
    navigate(`/edit-track/${trackId}`);
  };

  const handleSaveProfile = (userData: any) => {
    if (user) {
      user.updateProfile(userData);
      setEditingProfile(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    }
  };

  const getStationNameById = (stationId: string) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'Unknown Station';
  };

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return format(date, 'MMM d, yyyy - h:mm a');
  };

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center mb-4 mt-2">
                  <Avatar className="h-20 w-20 mb-4">
                    <AvatarImage 
                      src={user.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`} 
                      alt={user.username} 
                    />
                    <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold text-xl">{user.username}</h2>
                  <p className="text-sm text-muted-foreground">Radio Host</p>
                </div>
                
                <div className="space-y-1 mt-6">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start" 
                    onClick={() => navigate('/upload-track')}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Mix
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => setEditingProfile(true)}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => navigate(`/host/${user.id}`)}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    Public Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Main content */}
          <div className="flex-1">
            {editingProfile ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Edit Profile</h1>
                  <Button 
                    variant="outline" 
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </Button>
                </div>
                <ProfileEditor 
                  user={user} 
                  onSave={handleSaveProfile}
                />
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold mb-6">Host Dashboard</h1>
                
                <Tabs defaultValue="mixes" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="mixes">
                      <Music className="h-4 w-4 mr-2" />
                      My Mixes
                    </TabsTrigger>
                    <TabsTrigger value="shows">
                      <Radio className="h-4 w-4 mr-2" />
                      My Shows
                    </TabsTrigger>
                    <TabsTrigger value="bookings">
                      <Calendar className="h-4 w-4 mr-2" />
                      Bookings
                    </TabsTrigger>
                    <TabsTrigger value="stats">
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Stats
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="mixes" className="mt-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Your Mixes</CardTitle>
                        <Button onClick={() => navigate('/upload-track')}>
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Upload New Mix
                        </Button>
                      </CardHeader>
                      <CardContent>
                        {userTracks.length === 0 ? (
                          <div className="text-center py-8">
                            <Music className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">You haven't uploaded any mixes yet</p>
                            <Button 
                              className="mt-4" 
                              onClick={() => navigate('/upload-track')}
                            >
                              Upload Your First Mix
                            </Button>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Plays</TableHead>
                                <TableHead>Likes</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userTracks.map(track => (
                                <TableRow key={track.id}>
                                  <TableCell className="font-medium">{track.title}</TableCell>
                                  <TableCell>{track.genre}</TableCell>
                                  <TableCell>{format(new Date(track.uploadDate), 'MMM d, yyyy')}</TableCell>
                                  <TableCell>{track.plays || 0}</TableCell>
                                  <TableCell>{track.likes}</TableCell>
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => handleEditTrack(track.id)}
                                      >
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteTrack(track.id)}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="shows" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Radio Shows</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {userStations.length === 0 ? (
                          <div className="text-center py-8">
                            <Radio className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">You don't have any radio shows yet</p>
                            <Button 
                              className="mt-4" 
                              onClick={() => navigate('/stations')}
                            >
                              Browse Stations
                            </Button>
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Station</TableHead>
                                <TableHead>Genre</TableHead>
                                <TableHead>Listeners</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userStations.map(station => (
                                <TableRow key={station.id}>
                                  <TableCell className="font-medium">{station.name}</TableCell>
                                  <TableCell>{station.genre}</TableCell>
                                  <TableCell>{station.listeners}</TableCell>
                                  <TableCell>
                                    {station.isLive ? (
                                      <span className="flex items-center text-green-500">
                                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                        Live
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground">Offline</span>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => navigate(`/stations/${station.id}`)}
                                    >
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="bookings" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Show Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="upcoming">
                          <TabsList className="mb-4">
                            <TabsTrigger value="upcoming">Upcoming ({approvedBookings.length})</TabsTrigger>
                            <TabsTrigger value="pending">Pending ({pendingBookings.length})</TabsTrigger>
                            <TabsTrigger value="rejected">Rejected ({rejectedBookings.length})</TabsTrigger>
                          </TabsList>
                          
                          <TabsContent value="upcoming">
                            {approvedBookings.length === 0 ? (
                              <div className="text-center py-8">
                                <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">You don't have any upcoming shows</p>
                                <Button 
                                  className="mt-4" 
                                  onClick={() => navigate('/stations')}
                                >
                                  Book a Show
                                </Button>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Show Title</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Actions</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {approvedBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                      <TableCell>{getStationNameById(booking.stationId)}</TableCell>
                                      <TableCell className="font-medium">{booking.title}</TableCell>
                                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                                      <TableCell>
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          onClick={() => navigate(`/stations/${booking.stationId}`)}
                                        >
                                          Go Live
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="pending">
                            {pendingBookings.length === 0 ? (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">You don't have any pending booking requests</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Show Title</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Status</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {pendingBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                      <TableCell>{getStationNameById(booking.stationId)}</TableCell>
                                      <TableCell className="font-medium">{booking.title}</TableCell>
                                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                                      <TableCell>
                                        <span className="text-yellow-500">Pending Approval</span>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="rejected">
                            {rejectedBookings.length === 0 ? (
                              <div className="text-center py-8">
                                <p className="text-muted-foreground">You don't have any rejected booking requests</p>
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>Station</TableHead>
                                    <TableHead>Show Title</TableHead>
                                    <TableHead>Date & Time</TableHead>
                                    <TableHead>Rejection Reason</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {rejectedBookings.map(booking => (
                                    <TableRow key={booking.id}>
                                      <TableCell>{getStationNameById(booking.stationId)}</TableCell>
                                      <TableCell className="font-medium">{booking.title}</TableCell>
                                      <TableCell>{formatDate(booking.startTime)} - {format(new Date(booking.endTime), 'h:mm a')}</TableCell>
                                      <TableCell className="text-red-500">
                                        {booking.rejectionReason || "No reason provided"}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="stats" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Statistics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <BarChart2 className="h-8 w-8 mx-auto text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{userTracks.reduce((sum, track) => sum + (track.plays || 0), 0)}</h3>
                                <p className="text-sm text-muted-foreground">Total Plays</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Music className="h-8 w-8 mx-auto text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{userTracks.length}</h3>
                                <p className="text-sm text-muted-foreground">Total Mixes</p>
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="pt-6">
                              <div className="text-center">
                                <Users className="h-8 w-8 mx-auto text-primary mb-2" />
                                <h3 className="text-2xl font-bold">{userTracks.reduce((sum, track) => sum + track.likes, 0)}</h3>
                                <p className="text-sm text-muted-foreground">Total Likes</p>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                        
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-4">Top Performing Mixes</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Mix</TableHead>
                                <TableHead>Plays</TableHead>
                                <TableHead>Likes</TableHead>
                                <TableHead>Comments</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {userTracks
                                .sort((a, b) => (b.plays || 0) - (a.plays || 0))
                                .slice(0, 5)
                                .map(track => (
                                  <TableRow key={track.id}>
                                    <TableCell className="font-medium">{track.title}</TableCell>
                                    <TableCell>{track.plays || 0}</TableCell>
                                    <TableCell>{track.likes}</TableCell>
                                    <TableCell>{track.comments?.length || 0}</TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HostDashboard;
