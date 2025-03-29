
import React from 'react';
import { Link } from 'react-router-dom';
import { Headphones } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const DJs: React.FC = () => {
  const { users } = useAuth();
  
  // Filter users to only get radio DJs
  const djs = users.filter(user => user.isRadioHost);
  
  // Create URL-friendly username for profile links
  const getUsernameSlug = (username: string) => {
    return username.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  };
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold flex gap-2 items-center">
              <Headphones className="h-8 w-8" />
              Our Radio DJs
            </h1>
          </div>
          
          {djs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {djs.map(dj => (
                <Card key={dj.id} className="overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-blue-dark to-blue"></div>
                  <div className="px-6 -mt-12 mb-4">
                    <Avatar className="h-24 w-24 border-4 border-white">
                      <AvatarImage 
                        src={dj.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${dj.username}`} 
                        alt={dj.username} 
                      />
                      <AvatarFallback>{dj.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </div>
                  <CardHeader className="pt-0">
                    <CardTitle className="text-xl">{dj.username}</CardTitle>
                    {(dj.biography || dj.bio) && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {dj.biography || dj.bio}
                      </p>
                    )}
                  </CardHeader>
                  <CardFooter>
                    <Link to={`/dj/${getUsernameSlug(dj.username)}`} className="w-full">
                      <Button variant="default" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-center">
                  No radio DJs found. Check back later!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default DJs;
