
import React from 'react';

interface S3InfoBoxProps {
  isConfigured?: boolean;
}

const S3InfoBox: React.FC<S3InfoBoxProps> = ({ isConfigured }) => {
  if (isConfigured) {
    return (
      <div className="mt-6 p-3 bg-green-50 dark:bg-green-950 text-green-800 dark:text-green-300 rounded-md text-sm">
        S3 storage is configured and ready to use. Uploads will be stored in your S3 bucket.
      </div>
    );
  }
  
  return (
    <div className="bg-blue-50 dark:bg-blue-950 rounded-md p-3 mb-6">
      <p className="text-sm text-blue-800 dark:text-blue-200">
        Configure an S3-compatible storage provider to store uploaded media files.
        For Wasabi storage, use the Wasabi tab to get region-specific settings.
      </p>
    </div>
  );
};

export default S3InfoBox;
