
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioStation } from '@/models/RadioStation';

interface StreamConfigFormProps {
  currentStation: RadioStation | null;
  streamUrl: string;
  streamPort: string;
  streamPassword: string;
  setStreamUrl: (url: string) => void;
  setStreamPort: (port: string) => void;
  setStreamPassword: (password: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

const StreamConfigForm: React.FC<StreamConfigFormProps> = ({
  currentStation,
  streamUrl,
  streamPort,
  streamPassword,
  setStreamUrl,
  setStreamPort,
  setStreamPassword,
  handleSubmit
}) => {
  // Add validation state
  const [isFormDirty, setIsFormDirty] = useState(false);
  
  // Wrap the setters to track changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreamUrl(e.target.value);
    setIsFormDirty(true);
  };
  
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreamPort(e.target.value);
    setIsFormDirty(true);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStreamPassword(e.target.value);
    setIsFormDirty(true);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stream Configuration</CardTitle>
        <CardDescription>
          Set up the streaming details for {currentStation?.name || 'your station'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="stream-config-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="streamUrl">Stream URL</Label>
            <Input
              id="streamUrl"
              value={streamUrl}
              onChange={handleUrlChange}
              placeholder="e.g., cast.yourstreamingservice.com"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the URL without http:// or https://
            </p>
          </div>
          
          <div>
            <Label htmlFor="streamPort">Port</Label>
            <Input
              id="streamPort"
              value={streamPort}
              onChange={handlePortChange}
              placeholder="e.g., 8000"
            />
          </div>
          
          <div>
            <Label htmlFor="streamPassword">Stream Password</Label>
            <Input
              id="streamPassword"
              type="password"
              value={streamPassword}
              onChange={handlePasswordChange}
              placeholder="Your stream password"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          form="stream-config-form"
          disabled={!isFormDirty}
        >
          Save Streaming Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StreamConfigForm;
