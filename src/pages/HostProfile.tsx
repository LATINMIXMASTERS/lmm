
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User as UserIcon, Calendar, Clock, HeadphonesIcon, Radio, Edit, Trash2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/contexts/TrackContext';
import { useRadio } from '@/contexts/RadioContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Track } from '@/models/Track';

const HostProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { user, users } = useAuth();
  const { tracks, getTracksByUser, deleteTrack, canEditTrack } = useTrack();
  const { stations, setCurrentPlayingStation } = useRadio();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [trackToDelete, setTrackToDelete] = useState<Track | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Find host user
  const hostUser = users.find(u => u.id === userId && u.isRadioHost);
  
  // Get host's tracks and shows
  const userTracks = hostUser ? getTracksByUser(hostUser.id) : [];
  
  // Filter stations where this host is featured
  const hostStations = stations.filter(station => 
    station.hosts && station.hosts.includes(hostUser?.id || '')
  );
  
  // User not found or not a host
  if (!hostUser || !hostUser.isRadioHost) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold mb-2">Radio Host Not Found</h2>
              <p className="text-muted-foreground mb-6">The radio host you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate('/')}>Back to Home</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }
  
  const startListening = (stationId: string) => {
    setCurrentPlayingStation(stationId);
    toast({
      title: "Now Playing",
      description: `Started playing radio station`
    });
  };

  const handleEditTrack = (trackId: string) => {
    navigate(`/edit-track/${trackId}`);
  };

  const handleDeleteTrack = (track: Track) => {
    setTrackToDelete(track);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTrack = () => {
    if (trackToDelete) {
      const success = deleteTrack(trackToDelete.id);
      if (success) {
        toast({
          title: "Track deleted",
          description: "The track has been removed",
        });
      }
    }
    setIsDeleteDialogOpen(false);
    setTrackToDelete(null);
  };
  
  // Check if current user can manage this track (admin or track owner)
  const canManageTrack = (track: Track) => {
    if (!user) return false;
    return user.isAdmin || track.uploadedBy === user.id;
  };

  // Render track action buttons for edit/delete
  const renderTrackActions = (track: Track) => {
    if (!canManageTrack(track)) return null;
    
    return (
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleEditTrack(track.id)}
          className="h-8 w-8 text-blue"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => handleDeleteTrack(track)}
          className="h-8 w-8 text-red-500"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        {/* Banner and Profile */}
        <div className="relative mb-8">
          {/* Banner */}
          <div className="w-full h-48 md:h-64 bg-gradient-to-r from-blue-dark to-blue rounded-lg overflow-hidden">
            {/* Optional background image would go here */}
          </div>
          
          {/* Profile info */}
          <div className="absolute bottom-0 left-0 w-full transform translate-y-1/2 px-4">
            <div className="max-w-5xl mx-auto flex items-end">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white">
                <AvatarImage 
                  src={hostUser.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${hostUser.username}`} 
                  alt={hostUser.username} 
                />
                <AvatarFallback>{hostUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <div className="ml-4 mb-2 md:mb-4 bg-white/80 backdrop-blur-sm p-2 rounded-lg">
                <h1 className="text-2xl md:text-3xl font-bold">{hostUser.username}</h1>
                <p className="text-muted-foreground">Radio Host</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="max-w-5xl mx-auto pt-16">
          {/* Host Bio */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About {hostUser.username}</CardTitle>
            </CardHeader>
            <CardContent>
              {hostUser.biography ? (
                <p>{hostUser.biography}</p>
              ) : (
                <p className="text-muted-foreground italic">This host hasn't added a biography yet.</p>
              )}
              
              {/* Social Links */}
              {hostUser.socialLinks && Object.values(hostUser.socialLinks).some(link => !!link) && (
                <div className="mt-4 flex gap-3">
                  <h3 className="font-medium">Follow on:</h3>
                  {hostUser.socialLinks.facebook && (
                    <a href={hostUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      Facebook
                    </a>
                  )}
                  {hostUser.socialLinks.twitter && (
                    <a href={hostUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      Twitter
                    </a>
                  )}
                  {hostUser.socialLinks.instagram && (
                    <a href={hostUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      Instagram
                    </a>
                  )}
                  {hostUser.socialLinks.youtube && (
                    <a href={hostUser.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      YouTube
                    </a>
                  )}
                  {hostUser.socialLinks.soundcloud && (
                    <a href={hostUser.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer" className="text-blue hover:underline">
                      SoundCloud
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Tabs for Shows and Mixes */}
          <Tabs defaultValue="mixes" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mixes">Mixes</TabsTrigger>
              <TabsTrigger value="shows">Radio Shows</TabsTrigger>
            </TabsList>
            
            {/* Mixes Tab */}
            <TabsContent value="mixes">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">{hostUser.username}'s Mixes</h2>
                {user && (user.id === hostUser.id || user.isAdmin) && (
                  <Button onClick={() => navigate('/upload-track')}>
                    Upload New Mix
                  </Button>
                )}
              </div>
              
              {userTracks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTracks.map(track => (
                    <Card key={track.id} className="overflow-hidden">
                      <div className="aspect-video relative">
                        <img 
                          src={track.coverImage} 
                          alt={track.title} 
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-0 right-0 p-2 flex gap-1">
                          {canManageTrack(track) && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleEditTrack(track.id)}
                                className="h-8 w-8 bg-white/70 hover:bg-white text-blue"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleDeleteTrack(track)}
                                className="h-8 w-8 bg-white/70 hover:bg-white text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      <CardHeader>
                        <CardTitle>{track.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{track.genre}</p>
                      </CardHeader>
                      <CardFooter>
                        <Button 
                          onClick={() => navigate(`/mixes?track=${track.id}`)}
                          className="w-full"
                        >
                          <HeadphonesIcon className="mr-2 h-4 w-4" />
                          Listen Now
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground mb-4">This DJ hasn't uploaded any mixes yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Radio Shows Tab */}
            <TabsContent value="shows">
              <h2 className="text-2xl font-bold mb-4">{hostUser.username}'s Radio Shows</h2>
              
              {hostStations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hostStations.map(station => (
                    <Card key={station.id}>
                      <div className="flex md:flex-row flex-col p-4 gap-4">
                        <div className="w-full md:w-1/3 aspect-video rounded-md overflow-hidden">
                          <img 
                            src={station.image} 
                            alt={station.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{station.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {station.genre}
                          </p>
                          <div className="flex items-center gap-2 text-sm mb-4">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{station.broadcastTime || "24/7 Broadcast"}</span>
                          </div>
                          <Button 
                            onClick={() => startListening(station.id)}
                            variant="default"
                            className="w-full"
                          >
                            <Radio className="mr-2 h-4 w-4" />
                            Listen Now
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-muted-foreground">This DJ doesn't have any upcoming radio shows.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the track "{trackToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTrack} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default HostProfile;
