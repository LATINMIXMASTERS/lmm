import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/contexts/AuthContext";

interface ProfileEditorProps {
  user: User;
  onSave: (userData: Partial<User>) => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onSave }) => {
  const [profileData, setProfileData] = useState<Partial<User>>({
    profileImage: user.profileImage || `https://api.dicebear.com/7.x/personas/svg?seed=${user.username}`,
    biography: user.biography || '',
    socialLinks: {
      facebook: user.socialLinks?.facebook || '',
      twitter: user.socialLinks?.twitter || '',
      instagram: user.socialLinks?.instagram || '',
      soundcloud: user.socialLinks?.soundcloud || '',
      youtube: user.socialLinks?.youtube || ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProfileData(prev => {
        const parentObj = typeof prev[parent as keyof typeof prev] === 'object' 
          ? prev[parent as keyof typeof prev] 
          : {};
          
        return {
          ...prev,
          [parent]: {
            ...(parentObj as object),
            [child]: value
          }
        };
      });
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(profileData);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your profile information and social media links</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profileData.profileImage} alt={user.username} />
              <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="profileImage">Profile Image URL</Label>
              <Input
                id="profileImage"
                name="profileImage"
                value={profileData.profileImage}
                onChange={handleInputChange}
                placeholder="Enter image URL"
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Paste a URL to your profile image or use the default generated avatar
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="biography">Biography</Label>
            <Textarea
              id="biography"
              name="biography"
              value={profileData.biography}
              onChange={handleInputChange}
              placeholder="Tell us about yourself..."
              className="mt-1 min-h-[120px]"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Social Media Links</h3>
            
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="socialLinks.facebook">Facebook</Label>
                <Input
                  id="socialLinks.facebook"
                  name="socialLinks.facebook"
                  value={profileData.socialLinks?.facebook}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialLinks.twitter">Twitter</Label>
                <Input
                  id="socialLinks.twitter"
                  name="socialLinks.twitter"
                  value={profileData.socialLinks?.twitter}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialLinks.instagram">Instagram</Label>
                <Input
                  id="socialLinks.instagram"
                  name="socialLinks.instagram"
                  value={profileData.socialLinks?.instagram}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/username"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="socialLinks.soundcloud">SoundCloud</Label>
                <Input
                  id="socialLinks.soundcloud"
                  name="socialLinks.soundcloud"
                  value={profileData.socialLinks?.soundcloud}
                  onChange={handleInputChange}
                  placeholder="https://soundcloud.com/username"
                  className="mt-1"
                />
              </div>
              
              <div className="sm:col-span-2">
                <Label htmlFor="socialLinks.youtube">YouTube</Label>
                <Input
                  id="socialLinks.youtube"
                  name="socialLinks.youtube"
                  value={profileData.socialLinks?.youtube}
                  onChange={handleInputChange}
                  placeholder="https://youtube.com/channel/channelId"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ProfileEditor;
