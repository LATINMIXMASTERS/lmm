
import React, { useState, useEffect } from 'react';
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
  const [formValues, setFormValues] = useState({
    url: '',
    port: '',
    password: ''
  });
  
  // Update form values when station changes
  useEffect(() => {
    setFormValues({
      url: streamUrl,
      port: streamPort,
      password: streamPassword
    });
  }, [streamUrl, streamPort, streamPassword, currentStation]);
  
  // Wrap the setters to track changes
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormValues(prev => ({ ...prev, url: newValue }));
    setStreamUrl(newValue);
    setIsFormDirty(true);
  };
  
  const handlePortChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormValues(prev => ({ ...prev, port: newValue }));
    setStreamPort(newValue);
    setIsFormDirty(true);
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setFormValues(prev => ({ ...prev, password: newValue }));
    setStreamPassword(newValue);
    setIsFormDirty(true);
  };
  
  const onSubmit = (e: React.FormEvent) => {
    handleSubmit(e);
    // Reset the form dirty state after submission
    setIsFormDirty(false);
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
        <form id="stream-config-form" onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="streamUrl">Stream URL</Label>
            <Input
              id="streamUrl"
              value={formValues.url}
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
              value={formValues.port}
              onChange={handlePortChange}
              placeholder="e.g., 8000"
            />
          </div>
          
          <div>
            <Label htmlFor="streamPassword">Stream Password</Label>
            <Input
              id="streamPassword"
              type="password"
              value={formValues.password}
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
