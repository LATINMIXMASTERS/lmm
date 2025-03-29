
import React from 'react';
import { AlertTriangle, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface S3ConfigAlertProps {
  s3Configured: boolean;
}

const S3ConfigAlert: React.FC<S3ConfigAlertProps> = ({ s3Configured }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  if (s3Configured) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>S3 Storage Required</AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-2">
          S3 storage configuration is <strong>mandatory</strong> for all uploads. 
          All audio tracks (up to 250MB) and images (up to 1MB) must be uploaded to S3.
        </p>
        
        {isAdmin ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/admin-dashboard')}
            className="mt-2"
          >
            Configure S3 Storage
          </Button>
        ) : (
          <p className="text-sm italic">
            Please contact an administrator to configure S3 storage.
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default S3ConfigAlert;
