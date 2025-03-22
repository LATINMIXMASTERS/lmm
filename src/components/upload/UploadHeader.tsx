
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

interface UploadHeaderProps {
  children: React.ReactNode;
}

const UploadHeader: React.FC<UploadHeaderProps> = ({ children }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload your mix</CardTitle>
        <CardDescription>
          Share your music with the Latin Mix Masters community
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default UploadHeader;
