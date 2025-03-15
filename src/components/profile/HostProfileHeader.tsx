
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HostProfileHeaderProps {
  hostUser: {
    id: string;
    username: string;
    profileImage?: string;
    biography?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
      soundcloud?: string;
    };
  };
}

const HostProfileHeader: React.FC<HostProfileHeaderProps> = ({ hostUser }) => {
  return (
    <>
      <div className="relative mb-8">
        <div className="w-full h-48 md:h-64 bg-gradient-to-r from-blue-dark to-blue rounded-lg overflow-hidden">
        </div>
        
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
      
      <div className="max-w-5xl mx-auto pt-16">
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
      </div>
    </>
  );
};

export default HostProfileHeader;
