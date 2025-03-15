
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, BarChart2, Radio, Calendar } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useRadio } from '@/hooks/useRadioContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import ProfileEditor from '@/components/ProfileEditor';

// Import the new components
import Sidebar from '@/components/host-dashboard/Sidebar';
import MixesList from '@/components/host-dashboard/MixesList';
import RadioShows from '@/components/host-dashboard/RadioShows';
import BookingsList from '@/components/host-dashboard/BookingsList';
import StatisticsPanel from '@/components/host-dashboard/StatisticsPanel';

const HostDashboard: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { tracks, getTracksByUser, deleteTrack } = useTrack();
  const { stations, bookings, cancelBooking } = useRadio();
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

  const handleDeleteBooking = (bookingId: string) => {
    cancelBooking(bookingId);
    toast({
      title: "Booking deleted",
      description: "The booking has been removed",
    });
  };

  const handleEditTrack = (trackId: string) => {
    navigate(`/edit-track/${trackId}`);
  };

  const handleSaveProfile = (userData: any) => {
    if (user) {
      updateProfile(userData);
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
          {/* Sidebar Component */}
          <Sidebar 
            user={user} 
            onEditProfile={() => setEditingProfile(true)} 
          />
          
          {/* Main content */}
          <div className="flex-1">
            {editingProfile ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">Edit Profile</h1>
                  <button 
                    className="px-4 py-2 border rounded-md"
                    onClick={() => setEditingProfile(false)}
                  >
                    Cancel
                  </button>
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
                  
                  {/* Mixes Tab */}
                  <TabsContent value="mixes" className="mt-4">
                    <MixesList 
                      tracks={userTracks} 
                      onEditTrack={handleEditTrack}
                      onDeleteTrack={handleDeleteTrack}
                    />
                  </TabsContent>
                  
                  {/* Shows Tab */}
                  <TabsContent value="shows" className="mt-4">
                    <RadioShows stations={userStations} />
                  </TabsContent>
                  
                  {/* Bookings Tab */}
                  <TabsContent value="bookings" className="mt-4">
                    <BookingsList 
                      approvedBookings={approvedBookings}
                      pendingBookings={pendingBookings}
                      rejectedBookings={rejectedBookings}
                      getStationName={getStationNameById}
                      formatDate={formatDate}
                      onDeleteBooking={handleDeleteBooking}
                    />
                  </TabsContent>
                  
                  {/* Stats Tab */}
                  <TabsContent value="stats" className="mt-4">
                    <StatisticsPanel tracks={userTracks} />
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
