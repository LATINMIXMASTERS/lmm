
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Tag, Trash2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useTrack } from '@/hooks/useTrackContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const ManageGenres: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { genres, addGenre } = useTrack();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [newGenre, setNewGenre] = useState('');
  
  // Check authentication and admin status
  React.useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "You need to be logged in to manage genres",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    // Check if user is an admin or host
    if (user && !user.isAdmin && !user.isRadioHost) {
      toast({
        title: "Access Denied",
        description: "Only admins and registered hosts can manage genres",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
  }, [isAuthenticated, user, navigate, toast]);
  
  const handleAddGenre = () => {
    if (!newGenre.trim()) {
      toast({
        title: "Empty genre name",
        description: "Please enter a genre name",
        variant: "destructive"
      });
      return;
    }
    
    try {
      addGenre(newGenre.trim());
      setNewGenre('');
    } catch (error) {
      // Error is already handled in the context
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Manage Genres</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Genre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={newGenre}
                  onChange={(e) => setNewGenre(e.target.value)}
                  placeholder="Enter genre name"
                  className="flex-1"
                />
                <Button onClick={handleAddGenre}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Existing Genres</CardTitle>
            </CardHeader>
            <CardContent>
              {genres.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No genres have been created yet
                </div>
              ) : (
                <div className="space-y-2">
                  {genres.map(genre => (
                    <div 
                      key={genre.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-blue" />
                        <span>{genre.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ManageGenres;
