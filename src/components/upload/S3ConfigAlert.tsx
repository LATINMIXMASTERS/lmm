
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface S3ConfigAlertProps {
  s3Configured: boolean;
}

const S3ConfigAlert: React.FC<S3ConfigAlertProps> = ({ s3Configured }) => {
  if (s3Configured) return null;
  
  return (
    <Alert className="bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-800">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>
        S3 storage is not configured. File uploads will use local storage instead. 
        To configure S3 storage, go to Admin Dashboard and set up your S3 provider.
      </AlertDescription>
    </Alert>
  );
};

export default S3ConfigAlert;
