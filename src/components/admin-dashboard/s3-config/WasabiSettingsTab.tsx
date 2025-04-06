
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { S3StorageConfig, backblazeRegions } from './S3ConfigTypes';

interface BackblazeSettingsTabProps {
  config: S3StorageConfig;
  updateConfig: (key: keyof S3StorageConfig, value: string) => void;
  isEditing: boolean;
}

const BackblazeSettingsTab: React.FC<BackblazeSettingsTabProps> = ({ config, updateConfig, isEditing }) => {
  const [regions, setRegions] = useState<string[]>([]);
  
  useEffect(() => {
    // Get region values from backblazeRegions array
    setRegions(backblazeRegions.map(region => region.value));
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="backblaze-access-key">Application Key ID</Label>
        <Input
          id="backblaze-access-key"
          placeholder="Enter Backblaze Application Key ID"
          value={config.accessKeyId || ''}
          onChange={(e) => updateConfig('accessKeyId', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="backblaze-secret-key">Application Key</Label>
        <Input
          id="backblaze-secret-key"
          placeholder="Enter Backblaze Application Key"
          type="password"
          value={config.secretAccessKey || ''}
          onChange={(e) => updateConfig('secretAccessKey', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="backblaze-region">Region</Label>
        <Select 
          value={config.region || ''} 
          onValueChange={(value) => updateConfig('region', value)}
          disabled={!isEditing}
        >
          <SelectTrigger id="backblaze-region">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {backblazeRegions.map((region) => (
              <SelectItem key={region.value} value={region.value}>
                {region.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="backblaze-bucket">Bucket Name</Label>
        <Input
          id="backblaze-bucket"
          placeholder="Enter bucket name"
          value={config.bucketName || ''}
          onChange={(e) => updateConfig('bucketName', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="backblaze-endpoint">Custom Endpoint URL (Optional)</Label>
        <Input
          id="backblaze-endpoint"
          placeholder="https://s3.us-west-004.backblazeb2.com"
          value={config.endpoint || ''}
          onChange={(e) => updateConfig('endpoint', e.target.value)}
          disabled={!isEditing}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to use the default Backblaze B2 endpoint for your selected region
        </p>
      </div>
    </div>
  );
};

export default BackblazeSettingsTab;
