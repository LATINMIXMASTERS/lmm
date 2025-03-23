import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Upload } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { fileToDataUrl, validateImageFile } from '@/services/imageUploadService';
import { uploadFileToS3, isS3Configured } from '@/services/s3UploadService';

interface ProfileHeaderProps {
  profileUser: {
    id: string;
    username: string;
    profileImage?: string;
    biography?: string;
    isRadioHost?: boolean;
    isAdmin?: boolean;
    registeredAt?: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      instagram?: string;
      youtube?: string;
    };
  };
  isOwnProfile: boolean;
  setEditMode: (editMode: boolean) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profileUser, isOwnProfile, setEditMode }) => {
  const { updateProfile } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleProfileImageClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Try to upload to S3 first if configured
      const isS3Ready = isS3Configured();
      let imageUrl;
      
      if (isS3Ready) {
        // Upload to S3
        const result = await uploadFileToS3(file, 'profiles');
        if (result.success) {
          imageUrl = result.url;
        } else {
          throw new Error(result.error || 'Failed to upload to S3');
        }
      } else {
        // Fallback to local data URL
        imageUrl = await fileToDataUrl(file);
      }
      
      updateProfile({ profileImage: imageUrl });
      
      toast({
        title: "Profile updated",
        description: "Your profile image has been updated"
      });
    } catch (error) {
      console.error('Profile image upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload profile image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
      <div className="relative">
        <Avatar className="h-24 w-24 md:h-32 md:w-32" 
                onClick={handleProfileImageClick}
                style={{ cursor: isOwnProfile ? 'pointer' : 'default' }}>
          <AvatarImage 
            src={profileUser.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${profileUser.username}`} 
            alt={profileUser.username} 
          />
          <AvatarFallback>{profileUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
          <h1 className="text-3xl md:text-4xl font-bold">{profileUser.username}</h1>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              onClick={() => setEditMode(true)}
              className="mt-2 md:mt-0"
            >
              Edit Profile
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
          {profileUser.isRadioHost && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Radio Host</span>
          )}
          {profileUser.isAdmin && (
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">Admin</span>
          )}
          <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Joined {new Date(profileUser.registeredAt || Date.now()).toLocaleDateString()}
          </span>
        </div>
        
        {profileUser.biography && (
          <p className="text-muted-foreground mb-4">
            {profileUser.biography}
          </p>
        )}
        
        {profileUser.socialLinks && Object.values(profileUser.socialLinks).some(link => !!link) && (
          <div className="flex gap-3 justify-center md:justify-start mb-4">
            {profileUser.socialLinks.facebook && (
              <a href={profileUser.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Facebook size={20} />
              </a>
            )}
            {profileUser.socialLinks.twitter && (
              <a href={profileUser.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Twitter size={20} />
              </a>
            )}
            {profileUser.socialLinks.instagram && (
              <a href={profileUser.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Instagram size={20} />
              </a>
            )}
            {profileUser.socialLinks.youtube && (
              <a href={profileUser.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary">
                <Youtube size={20} />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
