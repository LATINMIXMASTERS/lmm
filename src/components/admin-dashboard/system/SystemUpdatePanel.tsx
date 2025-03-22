
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SystemUpdateCard from './SystemUpdateCard';
import InstructionsGenerator from './InstructionsGenerator';

const SystemUpdatePanel: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Management</CardTitle>
        <CardDescription>
          Update the system and download installation instructions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SystemUpdateCard />
          <InstructionsGenerator />
        </div>
      </CardContent>
    </Card>
  );
};

export default SystemUpdatePanel;
