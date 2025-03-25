
import React from 'react';
import { DatabaseBackup } from 'lucide-react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const S3HeaderSection: React.FC = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <DatabaseBackup className="h-5 w-5 text-blue" />
        S3 Storage Configuration
      </CardTitle>
      <CardDescription>
        Configure S3-compatible storage for tracks, images, and other media files
      </CardDescription>
    </CardHeader>
  );
};

export default S3HeaderSection;
