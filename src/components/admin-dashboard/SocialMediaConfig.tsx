
import React, { useState } from 'react';
import { Github, Twitter, Instagram, Facebook, Youtube, Linkedin, Save } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const socialIcons = {
  twitter: <Twitter className="h-5 w-5" />,
  instagram: <Instagram className="h-5 w-5" />,
  facebook: <Facebook className="h-5 w-5" />,
  github: <Github className="h-5 w-5" />,
  youtube: <Youtube className="h-5 w-5" />,
  linkedin: <Linkedin className="h-5 w-5" />
};

interface SocialLinkType {
  platform: string;
  url: string;
  active: boolean;
}

const SocialMediaConfig: React.FC = () => {
  const { toast } = useToast();
  const [socialLinks, setSocialLinks] = useState<SocialLinkType[]>([
    { platform: 'twitter', url: 'https://twitter.com/latinmixmasters', active: true },
    { platform: 'instagram', url: 'https://instagram.com/latinmixmasters', active: true },
    { platform: 'facebook', url: 'https://facebook.com/latinmixmasters', active: true },
    { platform: 'youtube', url: 'https://youtube.com/latinmixmasters', active: false },
    { platform: 'github', url: '', active: false },
    { platform: 'linkedin', url: '', active: false }
  ]);

  const handleUrlChange = (index: number, newUrl: string) => {
    const newLinks = [...socialLinks];
    newLinks[index].url = newUrl;
    setSocialLinks(newLinks);
  };

  const toggleActive = (index: number) => {
    const newLinks = [...socialLinks];
    newLinks[index].active = !newLinks[index].active;
    setSocialLinks(newLinks);
  };

  const saveSocialLinks = () => {
    // Here you would save to your backend/database
    // For now we'll just show a toast
    toast({
      title: "Social media links updated",
      description: "Your changes have been saved successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Configure the social media links that appear in the footer and other areas of the site
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {socialLinks.map((link, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                {socialIcons[link.platform as keyof typeof socialIcons]}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center mb-1">
                  <h3 className="font-medium capitalize">{link.platform}</h3>
                </div>
                <Input 
                  value={link.url} 
                  onChange={(e) => handleUrlChange(index, e.target.value)}
                  placeholder={`Enter ${link.platform} URL`}
                  className="w-full"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`active-${link.platform}`}
                    checked={link.active}
                    onChange={() => toggleActive(index)}
                    className="w-4 h-4"
                  />
                  <label htmlFor={`active-${link.platform}`} className="text-sm">Active</label>
                </div>
              </div>
            </div>
          ))}
          
          <Button onClick={saveSocialLinks} className="mt-6 w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialMediaConfig;
