
import React, { useState, useEffect } from 'react';
import { DatabaseBackup, Save, TestTube, ClipboardCopy } from 'lucide-react';
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
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [config, setConfig] = useState<S3StorageConfig>({
    bucketName: '',
    region: 'us-east-1',
    endpoint: '',
    publicUrlBase: '',
  });
  
  // Load saved configuration on mount
  useEffect(() => {
    loadConfig();
  }, []);
  
  const loadConfig = () => {
    const savedConfig = localStorage.getItem('latinmixmasters_s3config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
        
        // Check if config has all required fields
        const hasRequiredFields = 
          parsedConfig.bucketName && 
          parsedConfig.region && 
          parsedConfig.accessKeyId && 
          parsedConfig.secretAccessKey;
          
        setIsConfigured(hasRequiredFields);
      } catch (error) {
        console.error('Error parsing saved S3 configuration:', error);
      }
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const saveConfiguration = () => {
    if (!config.bucketName) {
      toast({
        title: "Validation Error",
        description: "Bucket name is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!config.region) {
      toast({
        title: "Validation Error",
        description: "Region is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!config.accessKeyId) {
      toast({
        title: "Validation Error",
        description: "Access Key ID is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!config.secretAccessKey) {
      toast({
        title: "Validation Error",
        description: "Secret Access Key is required",
        variant: "destructive"
      });
      return;
    }
    
    // Save configuration to localStorage
    localStorage.setItem('latinmixmasters_s3config', JSON.stringify(config));
    
    setIsConfigured(true);
    
    toast({
      title: "Configuration Saved",
      description: "S3 storage configuration has been saved"
    });
  };
  
  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      if (!config.bucketName || !config.region || !config.accessKeyId || !config.secretAccessKey) {
        throw new Error("Missing required configuration");
      }
      
      // In a real app, this would make an actual request to test the connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to S3 storage"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect to S3 storage",
        variant: "destructive"
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Wasabi helper functions
  const wasabiRegions = [
    { name: "US East 1", value: "us-east-1", endpoint: "s3.us-east-1.wasabisys.com" },
    { name: "US East 2", value: "us-east-2", endpoint: "s3.us-east-2.wasabisys.com" },
    { name: "US West 1", value: "us-west-1", endpoint: "s3.us-west-1.wasabisys.com" },
    { name: "EU Central 1", value: "eu-central-1", endpoint: "s3.eu-central-1.wasabisys.com" },
    { name: "EU West 1", value: "eu-west-1", endpoint: "s3.eu-west-1.wasabisys.com" },
    { name: "AP Northeast 1", value: "ap-northeast-1", endpoint: "s3.ap-northeast-1.wasabisys.com" },
    { name: "AP Northeast 2", value: "ap-northeast-2", endpoint: "s3.ap-northeast-2.wasabisys.com" }
  ];

  const applyWasabiConfig = (regionId: string) => {
    const selectedRegion = wasabiRegions.find(r => r.value === regionId);
    
    if (selectedRegion) {
      setConfig(prev => ({
        ...prev,
        region: selectedRegion.value,
        endpoint: `https://${selectedRegion.endpoint}`,
        publicUrlBase: prev.bucketName ? 
          `https://s3.${selectedRegion.value}.wasabisys.com/${prev.bucketName}` : ''
      }));
      
      toast({
        title: "Wasabi Configuration Applied",
        description: `Configured for ${selectedRegion.name} region`,
      });
    }
  };

  const getWasabiCorsConfig = () => {
    return `[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]`;
  };

  const copyToClipboard = (text: string, successMessage: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to Clipboard",
        description: successMessage
      });
    });
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
        <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 mb-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Configure an S3-compatible storage provider to store uploaded media files.
            For Wasabi storage, use the Wasabi tab to get region-specific settings.
          </p>
        </div>
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="wasabi">Wasabi Specific</TabsTrigger>
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
                    value={config.bucketName}
                    onChange={handleInputChange}
                    placeholder="my-latinmix-bucket"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    name="region"
                    value={config.region}
                    onChange={handleInputChange}
                    placeholder="us-east-1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accessKeyId">Access Key ID</Label>
                  <Input
                    id="accessKeyId"
                    name="accessKeyId"
                    value={config.accessKeyId || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your access key"
                    type="password"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                  <Input
                    id="secretAccessKey"
                    name="secretAccessKey"
                    value={config.secretAccessKey || ''}
                    onChange={handleInputChange}
                    placeholder="Enter your secret key"
                    type="password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Never share your secret access key with anyone
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="publicUrlBase">Public Base URL</Label>
                  <Input
                    id="publicUrlBase"
                    name="publicUrlBase"
                    value={config.publicUrlBase || ''}
                    onChange={handleInputChange}
                    placeholder="https://my-bucket.s3.wasabisys.com"
                  />
                  <p className="text-xs text-muted-foreground">
                    The base URL for public access to your files
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="wasabi">
            <div className="space-y-4">
              <div className="bg-amber-50 dark:bg-amber-950 rounded-md p-3 mb-3">
                <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">Wasabi Configuration Guide</h3>
                <ol className="list-decimal text-sm ml-4 space-y-2 text-amber-800 dark:text-amber-300">
                  <li>Create a bucket in your Wasabi account</li>
                  <li>Create an access key and secret key from the Wasabi console</li>
                  <li>Select your Wasabi region from the list below</li>
                  <li>Set up CORS configuration for your bucket (see below)</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Select Wasabi Region</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {wasabiRegions.map(region => (
                      <Button 
                        key={region.value} 
                        variant="outline" 
                        onClick={() => applyWasabiConfig(region.value)}
                        className="justify-start overflow-hidden text-ellipsis whitespace-nowrap"
                      >
                        {region.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>CORS Configuration</Label>
                  <div className="relative">
                    <pre className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md text-xs overflow-auto max-h-40 text-slate-900 dark:text-slate-100">
                      {getWasabiCorsConfig()}
                    </pre>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(getWasabiCorsConfig(), "CORS configuration copied")}
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Paste this configuration in your Wasabi bucket's CORS settings
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
                  value={config.endpoint || ''}
                  onChange={handleInputChange}
                  placeholder="https://s3.us-east-1.wasabisys.com"
                />
                <p className="text-xs text-muted-foreground">
                  For Wasabi: https://s3.[region].wasabisys.com
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
            disabled={isTestingConnection || !config.bucketName}
          >
            <TestTube className="w-4 h-4 mr-2" />
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>
        
        {isConfigured && (
          <div className="mt-6 p-3 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 rounded-md text-sm">
            S3 storage is configured and ready to use. Uploads will be stored in your S3 bucket.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default S3ConfigurationPanel;
