
import React from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';

interface S3ConfigAlertProps {
  s3Configured: boolean;
}

const S3ConfigAlert: React.FC<S3ConfigAlertProps> = ({ s3Configured }) => {
  const { user } = useAuth();

  if (s3Configured) {
    return null; // Don't show anything if S3 is configured
  }
  
  // Only show to admins or radio hosts
  if (!user || (!user.isAdmin && !user.isRadioHost)) {
    return null;
  }

  return (
    <Alert variant="default" className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
      <ExclamationTriangleIcon className="h-4 w-4 text-amber-600 dark:text-amber-500" />
      <AlertTitle className="text-amber-800 dark:text-amber-400">S3 Storage Required</AlertTitle>
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="mb-2">
          For uploads larger than 10MB, S3-compatible storage is required. 
          Without S3 configuration, uploads over 10MB will fail.
        </p>
        {user.isAdmin ? (
          <p>
            <Link 
              to="/admin-dashboard?tab=s3" 
              className="font-medium underline hover:text-amber-800"
            >
              Configure S3 storage
            </Link> in the admin dashboard.
          </p>
        ) : (
          <p>
            Please contact an administrator to configure S3 storage.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default S3ConfigAlert;
