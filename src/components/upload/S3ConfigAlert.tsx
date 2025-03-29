
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface S3ConfigAlertProps {
  s3Configured: boolean;
}

const S3ConfigAlert: React.FC<S3ConfigAlertProps> = ({ s3Configured }) => {
  if (s3Configured) return null;
  
  return (
    <Alert variant="default" className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
      <Info className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      <AlertTitle className="text-yellow-800 dark:text-yellow-300">S3 Storage Not Configured</AlertTitle>
      <AlertDescription className="text-yellow-700 dark:text-yellow-400">
        <p className="mb-2">
          S3 storage is not configured, which limits upload size to 5MB. Large files may fail to upload.
        </p>
        <p className="flex items-center gap-1">
          <Link 
            to="/admin-dashboard?tab=storage" 
            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center"
          >
            Configure S3 storage
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
          {' '}for better upload performance.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default S3ConfigAlert;
