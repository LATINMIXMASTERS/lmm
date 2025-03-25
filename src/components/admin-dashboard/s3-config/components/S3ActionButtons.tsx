
import React from 'react';
import { Save, TestTube } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="flex flex-wrap gap-3 mt-6">
      <Button 
        onClick={onSave} 
        className="bg-blue hover:bg-blue-600"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Configuration
      </Button>
      
      <Button 
        variant="outline" 
        onClick={onTest}
        disabled={isTestingConnection || !isValidForTesting}
      >
        <TestTube className="w-4 h-4 mr-2" />
        {isTestingConnection ? 'Testing...' : 'Test Connection'}
      </Button>
    </div>
  );
};

export default S3ActionButtons;
