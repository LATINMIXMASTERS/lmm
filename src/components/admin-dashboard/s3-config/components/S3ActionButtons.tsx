
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save, TestTube } from 'lucide-react';

interface S3ActionButtonsProps {
  onSave: () => void;
  onTest: () => void;
  isTestingConnection: boolean;
  isValidForTesting: boolean;
}

const S3ActionButtons: React.FC<S3ActionButtonsProps> = ({
  onSave,
  onTest,
  isTestingConnection,
  isValidForTesting
}) => {
  return (
    <div className="flex gap-4 mt-6">
      <Button 
        onClick={onSave} 
        className="flex-1"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Configuration
      </Button>
      
      <Button
        onClick={onTest}
        disabled={isTestingConnection || !isValidForTesting}
        variant="outline"
        className="flex-1"
      >
        <TestTube className="w-4 h-4 mr-2" />
        {isTestingConnection ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  );
};

export default S3ActionButtons;
