
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { S3StorageConfig } from './S3ConfigTypes';

interface AdvancedSettingsTabProps {
  config: S3StorageConfig;
  onConfigChange: (updatedConfig: Partial<S3StorageConfig>) => void;
}

const AdvancedSettingsTab: React.FC<AdvancedSettingsTabProps> = ({
  config,
  onConfigChange
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onConfigChange({ [name]: value });
  };

  return (
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
  );
};

export default AdvancedSettingsTab;
