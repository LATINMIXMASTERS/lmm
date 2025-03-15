
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-12">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <UserIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
          <p className="text-muted-foreground mb-6">The user you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserNotFound;
