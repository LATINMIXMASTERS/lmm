
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { S3StorageConfig } from './S3ConfigTypes';

interface GeneralSettingsTabProps {
  config: S3StorageConfig;
  onConfigChange: (updatedConfig: Partial<S3StorageConfig>) => void;
}

const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({ 
  config, 
  onConfigChange 
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onConfigChange({ [name]: value });
  };

  return (
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
  );
};

export default GeneralSettingsTab;
