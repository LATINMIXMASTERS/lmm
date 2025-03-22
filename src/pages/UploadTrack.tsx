
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import { useUploadPermission } from '@/hooks/track/useUploadPermission';
import UploadHeader from '@/components/upload/UploadHeader';
import UploadForm from '@/components/upload/UploadForm';

const UploadTrack: React.FC = () => {
  // Check if user has permission to upload
  useUploadPermission();
  
  return (
    <MainLayout>
      <div className="container py-8 md:py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">Upload Track</h1>
          
          <UploadHeader>
            <UploadForm />
          </UploadHeader>
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadTrack;
