
import React from 'react';

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
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-500 text-sm">{success}</div>}
    </>
  );
};

export default FormAlerts;
