
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const ActivityTab: React.FC = () => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground">User activity will be shown here in the future.</p>
      </CardContent>
    </Card>
  );
};

export default ActivityTab;
