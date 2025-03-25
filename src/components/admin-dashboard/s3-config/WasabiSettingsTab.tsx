
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { S3StorageConfig, wasabiRegions } from './S3ConfigTypes';

interface WasabiSettingsTabProps {
  config: S3StorageConfig;
  updateConfig: (key: keyof S3StorageConfig, value: string) => void;
  isEditing: boolean;
}

const WasabiSettingsTab: React.FC<WasabiSettingsTabProps> = ({ config, updateConfig, isEditing }) => {
  const [regions, setRegions] = useState<string[]>([]);
  
  useEffect(() => {
    // Get region values from wasabiRegions array
    setRegions(wasabiRegions.map(region => region.value));
  }, []);
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="wasabi-access-key">Access Key ID</Label>
        <Input
          id="wasabi-access-key"
          placeholder="Enter Wasabi Access Key"
          value={config.accessKeyId || ''}
          onChange={(e) => updateConfig('accessKeyId', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wasabi-secret-key">Secret Access Key</Label>
        <Input
          id="wasabi-secret-key"
          placeholder="Enter Wasabi Secret Key"
          type="password"
          value={config.secretAccessKey || ''}
          onChange={(e) => updateConfig('secretAccessKey', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wasabi-region">Region</Label>
        <Select 
          value={config.region || ''} 
          onValueChange={(value) => updateConfig('region', value)}
          disabled={!isEditing}
        >
          <SelectTrigger id="wasabi-region">
            <SelectValue placeholder="Select a region" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wasabi-bucket">Bucket Name</Label>
        <Input
          id="wasabi-bucket"
          placeholder="Enter bucket name"
          value={config.bucketName || ''}
          onChange={(e) => updateConfig('bucketName', e.target.value)}
          disabled={!isEditing}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="wasabi-endpoint">Custom Endpoint URL (Optional)</Label>
        <Input
          id="wasabi-endpoint"
          placeholder="https://s3.wasabisys.com"
          value={config.endpoint || ''}
          onChange={(e) => updateConfig('endpoint', e.target.value)}
          disabled={!isEditing}
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to use the default Wasabi endpoint for your selected region
        </p>
      </div>
    </div>
  );
};

export default WasabiSettingsTab;
