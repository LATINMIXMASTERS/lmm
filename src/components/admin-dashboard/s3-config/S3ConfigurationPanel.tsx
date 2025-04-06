
import React, { useState, useEffect } from 'react';
import { Cloud, Server, ShieldCheck, Lock, Key, Globe, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { S3StorageConfig, TestResult, backblazeRegions } from './S3ConfigTypes';
import { loadS3Config, saveS3Config } from './utils/configStorage';
import { testS3Connection } from './utils/connectionTester';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const S3ConfigurationPanel: React.FC = () => {
  const [config, setConfig] = useState<S3StorageConfig>(loadS3Config);
  const [showSecrets, setShowSecrets] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: keyof S3StorageConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));

    // Special case for region: auto-update endpoint for Backblaze B2
    if (field === 'region') {
      const selectedRegion = backblazeRegions.find(r => r.value === value);
      if (selectedRegion) {
        setConfig(prev => ({
          ...prev,
          region: value,
          endpoint: `https://${selectedRegion.endpoint}`,
          publicUrlBase: prev.bucketName ? 
            `https://${selectedRegion.endpoint}/${prev.bucketName}` : prev.publicUrlBase
        }));
      }
    }

    // Special case for bucket name: auto-update public URL base
    if (field === 'bucketName' && value && config.region) {
      const selectedRegion = backblazeRegions.find(r => r.value === config.region);
      if (selectedRegion) {
        setConfig(prev => ({
          ...prev,
          bucketName: value,
          publicUrlBase: `https://${selectedRegion.endpoint}/${value}`
        }));
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Validate configuration
      if (!config.bucketName || !config.region || !config.endpoint || 
          !config.accessKeyId || !config.secretAccessKey) {
        throw new Error('All fields are required');
      }

      // Save the configuration
      const saved = saveS3Config(config);
      
      if (saved) {
        toast({
          title: "Configuration saved",
          description: "Your S3 storage configuration has been saved successfully."
        });
      } else {
        throw new Error('Failed to save configuration');
      }
    } catch (error) {
      toast({
        title: "Save failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Validate configuration
      if (!config.bucketName || !config.region || !config.endpoint || 
          !config.accessKeyId || !config.secretAccessKey) {
        throw new Error('All fields are required for testing');
      }
      
      const result = await testS3Connection(config);
      setTestResult(result);
      
      if (result.success) {
        toast({
          title: "Connection successful",
          description: "Successfully connected to S3 storage"
        });
      } else {
        toast({
          title: "Connection failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred"
      });
      
      toast({
        title: "Test failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cloud className="w-5 h-5 mr-2 text-blue" />
            S3 Storage Configuration
          </CardTitle>
          <CardDescription>
            Configure Backblaze B2 Cloud Storage for file uploads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="config">
            <TabsList className="mb-4">
              <TabsTrigger value="config">Configuration</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="config">
              <div className="space-y-6">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bucketName">Bucket Name</Label>
                      <Input
                        id="bucketName"
                        value={config.bucketName}
                        onChange={(e) => handleChange('bucketName', e.target.value)}
                        placeholder="latinmixmasters"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="region">Region</Label>
                      <Select
                        value={config.region}
                        onValueChange={(value) => handleChange('region', value)}
                      >
                        <SelectTrigger id="region">
                          <SelectValue placeholder="Select a region" />
                        </SelectTrigger>
                        <SelectContent>
                          {backblazeRegions.map(region => (
                            <SelectItem key={region.value} value={region.value}>
                              {region.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endpoint">Endpoint</Label>
                    <Input
                      id="endpoint"
                      value={config.endpoint}
                      onChange={(e) => handleChange('endpoint', e.target.value)}
                      placeholder="https://s3.us-west-004.backblazeb2.com"
                    />
                    <p className="text-sm text-muted-foreground">
                      For Backblaze B2, this should be https://s3.[region].backblazeb2.com
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="publicUrlBase">Public URL Base</Label>
                    <Input
                      id="publicUrlBase"
                      value={config.publicUrlBase || ''}
                      onChange={(e) => handleChange('publicUrlBase', e.target.value)}
                      placeholder="https://s3.us-west-004.backblazeb2.com/bucketname"
                    />
                    <p className="text-sm text-muted-foreground">
                      URL used to access uploaded files. For Backblaze B2, typically https://s3.[region].backblazeb2.com/[bucketname]
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="accessKeyId" className="flex items-center">
                      <Key className="h-4 w-4 mr-1" />
                      Application Key ID
                    </Label>
                    <Input
                      id="accessKeyId"
                      value={config.accessKeyId || ''}
                      onChange={(e) => handleChange('accessKeyId', e.target.value)}
                      placeholder="Your Backblaze B2 application key ID"
                      type={showSecrets ? "text" : "password"}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="secretAccessKey" className="flex items-center">
                      <Lock className="h-4 w-4 mr-1" />
                      Application Key
                    </Label>
                    <Input
                      id="secretAccessKey"
                      value={config.secretAccessKey || ''}
                      onChange={(e) => handleChange('secretAccessKey', e.target.value)}
                      placeholder="Your Backblaze B2 application key"
                      type={showSecrets ? "text" : "password"}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showSecrets"
                      checked={showSecrets}
                      onChange={() => setShowSecrets(!showSecrets)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="showSecrets" className="cursor-pointer">
                      Show credentials
                    </Label>
                  </div>
                </div>
                
                {testResult && (
                  <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
                    <ShieldCheck className="h-4 w-4" />
                    <AlertTitle>{testResult.success ? "Success" : "Error"}</AlertTitle>
                    <AlertDescription>{testResult.message}</AlertDescription>
                  </Alert>
                )}
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={handleTest}
                    disabled={isTesting || isSaving}
                    className="flex items-center"
                  >
                    {isTesting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Server className="mr-2 h-4 w-4" />
                        Test Connection
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSave}
                    disabled={isTesting || isSaving}
                    className="flex items-center"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Cloud className="mr-2 h-4 w-4" />
                        Save Configuration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Setting Up Backblaze B2 Cloud Storage</h3>
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    <span className="font-medium">Create a Backblaze account:</span> If you don't have one, sign up at <a href="https://www.backblaze.com/sign-up/cloud-storage" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">backblaze.com</a>
                  </li>
                  <li>
                    <span className="font-medium">Create a bucket:</span> In your Backblaze B2 dashboard, create a new bucket with a unique name. Make sure it's set to "Public".
                  </li>
                  <li>
                    <span className="font-medium">Create application keys:</span> Generate an application key with access to this bucket. Go to App Keys and create a new application key.
                  </li>
                  <li>
                    <span className="font-medium">Configure CORS:</span> Add a CORS policy to allow uploads from your domain.
                  </li>
                </ol>
                
                <div className="bg-muted p-4 rounded-md">
                  <h4 className="font-medium mb-2">Sample CORS Configuration</h4>
                  <pre className="text-xs overflow-x-auto">
                    {JSON.stringify([
                      {
                        "allowedOrigins": ["*"],
                        "allowedOperations": [
                          "s3_delete",
                          "s3_get",
                          "s3_head",
                          "s3_post",
                          "s3_put"
                        ],
                        "allowedHeaders": ["*"],
                        "exposeHeaders": ["ETag"],
                        "maxAgeSeconds": 3600
                      }
                    ], null, 2)}
                  </pre>
                </div>
                
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertTitle>Important Security Note</AlertTitle>
                  <AlertDescription>
                    Your Backblaze B2 credentials are stored in your browser's localStorage. For production use, 
                    we recommend implementing server-side upload authentication.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default S3ConfigurationPanel;
