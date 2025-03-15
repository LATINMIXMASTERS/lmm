
import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Edit, Upload, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SiSoundcloud } from "react-icons/si";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface HostProfileHeaderProps {
  hostUser: any;
  onEditProfile?: () => void;
}

const HostProfileHeader: React.FC<HostProfileHeaderProps> = ({ hostUser, onEditProfile }) => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const isOwnProfile = user?.id === hostUser.id;
  
  const handleProfileImageClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Convert file to data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateProfile({ profileImage: reader.result });
          toast({
            title: "Profile updated",
            description: "Your profile image has been updated"
          });
        }
        setIsUploading(false);
      };
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "Failed to upload profile image",
          variant: "destructive"
        });
        setIsUploading(false);
      };
    } catch (error) {
      console.error(error);
      toast({
        title: "Upload failed",
        description: "Something went wrong",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-gold/10 to-transparent rounded-lg p-6 mb-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="relative">
          <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-2 ring-gold/30" 
                 onClick={handleProfileImageClick}
                 style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}>
            <AvatarImage src={hostUser.profileImage} alt={hostUser.username} />
            <AvatarFallback className="bg-gold text-black">
              {hostUser.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
            
            {isOwnProfile && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                <Upload className="h-8 w-8 text-white" />
              </div>
            )}
          </Avatar>
          
          {isOwnProfile && (
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={isUploading}
            />
          )}
        </div>

        <div className="flex-1 text-center md:text-left">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">{hostUser.username}</h1>
              <p className="text-gold font-medium">Radio Host & DJ</p>
            </div>
            
            {onEditProfile && isOwnProfile && (
              <Button onClick={onEditProfile} className="mt-4 md:mt-0">
                <Edit className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
          
          {hostUser.biography && (
            <p className="mt-4 text-muted-foreground">{hostUser.biography}</p>
          )}
          
          {hostUser.socialLinks && (
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
              {hostUser.socialLinks.facebook && (
                <a href={hostUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                  <Facebook className="h-5 w-5" />
                </a>
              )}
              {hostUser.socialLinks.twitter && (
                <a href={hostUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {hostUser.socialLinks.instagram && (
                <a href={hostUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                  <Instagram className="h-5 w-5" />
                </a>
              )}
              {hostUser.socialLinks.youtube && (
                <a href={hostUser.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                  <Youtube className="h-5 w-5" />
                </a>
              )}
              {hostUser.socialLinks.soundcloud && (
                <a href={hostUser.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-gold">
                  <SiSoundcloud className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HostProfileHeader;
