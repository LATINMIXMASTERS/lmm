
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { S3StorageConfig } from './S3ConfigTypes';
import { 
  loadS3Config, 
  saveS3Config, 
  isConfigComplete, 
  applyWasabiRegionSettings, 
  testS3Connection 
} from './S3ConfigUtils';

import { S3HeaderSection, S3InfoBox, S3ActionButtons } from './components';
import GeneralSettingsTab from './GeneralSettingsTab';
import WasabiSettingsTab from './WasabiSettingsTab';
import AdvancedSettingsTab from './AdvancedSettingsTab';

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
    const savedConfig = loadS3Config();
    setConfig(savedConfig);
    setIsConfigured(isConfigComplete(savedConfig));
  }, []);
  
  const handleConfigChange = (updatedConfig: Partial<S3StorageConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updatedConfig
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
    const saved = saveS3Config(config);
    
    if (saved) {
      setIsConfigured(true);
      
      toast({
        title: "Configuration Saved",
        description: "S3 storage configuration has been saved"
      });
    } else {
      toast({
        title: "Error Saving Configuration",
        description: "Failed to save S3 configuration",
        variant: "destructive"
      });
    }
  };
  
  const testConnection = async () => {
    setIsTestingConnection(true);
    
    try {
      const result = await testS3Connection(config);
      
      if (result.success) {
        toast({
          title: "Connection Successful",
          description: result.message
        });
      } else {
        toast({
          title: "Connection Failed",
          description: result.message,
          variant: "destructive"
        });
      }
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

  const handleSelectWasabiRegion = (regionId: string) => {
    const updatedConfig = applyWasabiRegionSettings(config, regionId);
    setConfig(updatedConfig);
    
    toast({
      title: "Wasabi Configuration Applied",
      description: `Configured for ${regionId} region`,
    });
  };
  
  return (
    <Card>
      <S3HeaderSection />
      
      <CardContent>
        <S3InfoBox />
        
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="wasabi">Wasabi Specific</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <GeneralSettingsTab 
              config={config} 
              onConfigChange={handleConfigChange} 
            />
          </TabsContent>

          <TabsContent value="wasabi">
            <WasabiSettingsTab 
              onSelectRegion={handleSelectWasabiRegion} 
            />
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedSettingsTab 
              config={config} 
              onConfigChange={handleConfigChange} 
            />
          </TabsContent>
        </Tabs>
        
        <S3ActionButtons 
          onSave={saveConfiguration}
          onTest={testConnection}
          isTestingConnection={isTestingConnection}
          isValidForTesting={!!config.bucketName}
        />
        
        {isConfigured && <S3InfoBox isConfigured={true} />}
      </CardContent>
    </Card>
  );
};

export default S3ConfigurationPanel;
