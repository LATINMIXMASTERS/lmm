
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mic, Volume2, ImageIcon, Users, Calendar as CalendarIcon, DatabaseBackup } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import refactored components
import StreamingSetup from '@/components/admin-dashboard/StreamingSetup';
import PlayerStreamUrls from '@/components/admin-dashboard/PlayerStreamUrls';
import StationImages from '@/components/admin-dashboard/StationImages';
import UserManagement from '@/components/admin-dashboard/UserManagement';
import ShowBookings from '@/components/admin-dashboard/ShowBookings';
import S3ConfigurationPanel from '@/components/admin-dashboard/S3StorageConfig';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!isAuthenticated || !user?.isAdmin) {
      toast({
        title: "Access denied",
        description: "You must be an admin to access this page.",
        variant: "destructive"
      });
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  const pendingBookingsCount = useAuth().users.filter(u => u.pendingApproval).length;
  const pendingUsersCount = useAuth().users.filter(u => u.pendingApproval).length;
  
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
            <TabsTrigger value="s3-storage" className="flex items-center">
              <DatabaseBackup className="w-4 h-4 mr-2" />
              S3 Storage
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
              {pendingUsersCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingUsersCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Show Bookings
              {pendingBookingsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {pendingBookingsCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="stations">
            <StreamingSetup />
          </TabsContent>
          
          <TabsContent value="streaming">
            <PlayerStreamUrls />
          </TabsContent>
          
          <TabsContent value="station-images">
            <StationImages />
          </TabsContent>
          
          <TabsContent value="s3-storage">
            <S3ConfigurationPanel />
          </TabsContent>
          
          <TabsContent value="users">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="bookings">
            <ShowBookings />
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
