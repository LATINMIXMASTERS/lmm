
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface FormAlertsProps {
  error?: string;
  success?: string;
  info?: string;
}

const FormAlerts: React.FC<FormAlertsProps> = ({
  error,
  success,
  info,
}) => {
  if (!error && !success && !info) return null;
  
  // Helper function to create a more user-friendly error message
  const formatErrorMessage = (errorMessage: string) => {
    // Handle common S3 upload errors
    if (errorMessage.includes('Network error') || errorMessage.includes('network')) {
      return (
        <>
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Could not connect to storage service. Please check:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Your internet connection is stable</li>
              <li>S3 configuration is correct (endpoint, region)</li>
              <li>Access credentials are valid</li>
            </ul>
          </AlertDescription>
        </>
      );
    }
    
    // Handle authentication errors
    if (errorMessage.includes('AccessDenied') || 
        errorMessage.includes('credentials') || 
        errorMessage.includes('permission')) {
      return (
        <>
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            <p>Storage service rejected your credentials. Please verify:</p>
            <ul className="list-disc pl-5 mt-2">
              <li>Access key and secret key are correct</li>
              <li>The bucket exists and you have write permissions</li>
              <li>The region matches your bucket's region</li>
            </ul>
          </AlertDescription>
        </>
      );
    }
    
    // Generic error fallback
    return <AlertDescription>{errorMessage}</AlertDescription>;
  };
  
  return (
    <>
      {error && (
        <Alert variant="destructive" className="flex items-start mb-4">
          <AlertCircle className="w-4 h-4 mr-2 mt-1 shrink-0" />
          <div className="flex-1">
            {formatErrorMessage(error)}
          </div>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-700 flex items-center mb-4">
          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      {info && (
        <Alert className="bg-blue-50 border-blue-200 text-blue-700 flex items-center mb-4">
          <Info className="w-4 h-4 mr-2 text-blue-500" />
          <AlertDescription>{info}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FormAlerts;
