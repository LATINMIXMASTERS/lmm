
import React from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface SubmitButtonProps {
  isUploading: boolean;
  isDisabled: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({ isUploading, isDisabled }) => {
  return (
    <Button 
      type="submit" 
      className="w-full"
      disabled={isUploading || isDisabled}
    >
      {isUploading ? (
        "Uploading..."
      ) : (
        <>
          <Upload className="w-4 h-4 mr-2" />
          Upload Mix
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
