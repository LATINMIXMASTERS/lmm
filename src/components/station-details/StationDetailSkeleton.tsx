
import React from 'react';
import MainLayout from '@/layout/MainLayout';

const StationDetailSkeleton: React.FC = () => {
  return (
    <MainLayout>
      <div className="container py-8 flex items-center justify-center">
        <p className="text-foreground">Loading station details...</p>
      </div>
    </MainLayout>
  );
};

export default StationDetailSkeleton;
