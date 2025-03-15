
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Settings, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from '@/contexts/AuthContext';

interface SidebarProps {
  user: User;
  onEditProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, onEditProfile }) => {
  const navigate = useNavigate();

  return (
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
              onClick={onEditProfile}
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
  );
};

export default Sidebar;
