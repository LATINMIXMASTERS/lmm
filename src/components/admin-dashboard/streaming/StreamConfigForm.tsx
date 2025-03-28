
import React from 'react';
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
              onChange={(e) => setStreamUrl(e.target.value)}
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
              onChange={(e) => setStreamPort(e.target.value)}
              placeholder="e.g., 8000"
            />
          </div>
          
          <div>
            <Label htmlFor="streamPassword">Stream Password</Label>
            <Input
              id="streamPassword"
              type="password"
              value={streamPassword}
              onChange={(e) => setStreamPassword(e.target.value)}
              placeholder="Your stream password"
            />
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button type="submit" form="stream-config-form">
          Save Streaming Settings
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StreamConfigForm;
