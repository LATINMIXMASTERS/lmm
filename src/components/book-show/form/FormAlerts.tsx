
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface FormAlertsProps {
  error?: string;
  success?: string;
}

const FormAlerts: React.FC<FormAlertsProps> = ({
  error,
  success,
}) => {
  if (!error && !success) return null;
  
  return (
    <>
      {error && (
        <Alert variant="destructive" className="flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-700 flex items-center">
          <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default FormAlerts;
