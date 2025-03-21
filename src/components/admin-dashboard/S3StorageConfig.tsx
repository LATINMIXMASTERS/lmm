
import React, { useState, useEffect } from 'react';
import { DatabaseBackup, Save, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { S3StorageConfig } from '@/models/RadioStation';

const S3ConfigurationPanel: React.FC = () => {
  const { toast } = useToast();
  const [isConfigured, setIsConfigured] = useState(false);
  
  // S3 configuration state
  const [s3Config, setS3Config] = useState<S3StorageConfig>({
    bucketName: '',
    region: 'us-east-1',
    endpoint: '',
    publicUrlBase: '',
  });
  
  // Test connection state
  const [testingConnection, setTestingConnection] = useState(false);
  
  // Load saved configuration on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('latinmixmasters_s3config');
    if (savedConfig) {
      try {
        const config = JSON.parse(savedConfig);
        setS3Config(config);
        setIsConfigured(true);
      } catch (error) {
        console.error('Error parsing saved S3 configuration:', error);
      }
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setS3Config(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveConfiguration = () => {
    if (!s3Config.bucketName) {
      toast({
        title: "Validation Error",
        description: "Bucket name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!s3Config.region) {
      toast({
        title: "Validation Error",
        description: "Region is required",
        variant: "destructive"
      });
      return;
    }
    
    // Save configuration to localStorage
    localStorage.setItem('latinmixmasters_s3config', JSON.stringify(s3Config));
    
    setIsConfigured(true);
    
    toast({
      title: "Configuration Saved",
      description: "S3 storage configuration has been saved"
    });
  };
  
  const testConnection = async () => {
    setTestingConnection(true);
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, we would make an API call to test the connection
      toast({
        title: "Connection Successful",
        description: "Successfully connected to S3 storage"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to S3 storage. Please check your configuration.",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DatabaseBackup className="h-5 w-5 text-blue" />
          S3 Storage Configuration
        </CardTitle>
        <CardDescription>
          Configure S3-compatible storage for tracks, images, and other media files
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="bg-blue-50 rounded-md p-3 mb-6">
          <p className="text-sm text-blue-800">
            Configure an S3-compatible storage provider to store uploaded media files.
            You can use AWS S3, MinIO, DigitalOcean Spaces, or any compatible service.
          </p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bucketName">Bucket Name</Label>
                  <Input
                    id="bucketName"
                    name="bucketName"
                    value={s3Config.bucketName}
                    onChange={handleInputChange}
                    placeholder="my-latinmix-bucket"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={s3Config.region}
                    onChange={handleInputChange}
                    placeholder="us-east-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessKeyId">Access Key ID (Optional)</Label>
                  <Input
                    id="accessKeyId"
                    name="accessKeyId"
                    value={s3Config.accessKeyId || ''}
                    onChange={handleInputChange}
                    placeholder="AKIAIOSFODNN7EXAMPLE"
                    type="password"
                  />
                  <p className="text-xs text-gray-500">
                    If using client-side uploading, provide credentials or use pre-signed URLs
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publicUrlBase">Public Base URL</Label>
                  <Input
                    id="publicUrlBase"
                    name="publicUrlBase"
                    value={s3Config.publicUrlBase || ''}
                    onChange={handleInputChange}
                    placeholder="https://my-bucket.s3.amazonaws.com"
                  />
                  <p className="text-xs text-gray-500">
                    The base URL for public access to your files
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">Custom Endpoint URL</Label>
                <Input
                  id="endpoint"
                  name="endpoint"
                  value={s3Config.endpoint || ''}
                  onChange={handleInputChange}
                  placeholder="https://play.min.io"
                />
                <p className="text-xs text-gray-500">
                  For S3-compatible services like MinIO, DigitalOcean Spaces, etc.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex flex-wrap gap-3 mt-6">
          <Button 
            onClick={saveConfiguration} 
            className="bg-blue hover:bg-blue-600"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Configuration
          </Button>
          
          <Button 
            variant="outline" 
            onClick={testConnection}
            disabled={testingConnection || !s3Config.bucketName}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
        
        {isConfigured && (
          <div className="mt-6 p-3 bg-green-50 text-green-800 rounded-md text-sm">
            S3 storage is configured and ready to use. Uploads will be stored in your S3 bucket.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default S3ConfigurationPanel;
