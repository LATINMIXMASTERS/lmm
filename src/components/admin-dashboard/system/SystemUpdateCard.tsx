
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemUpdateCard: React.FC = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSystemUpdate = async () => {
    setIsUpdating(true);
    try {
      // This would call your backend webhook in production
      // For demo purposes, we'll simulate an update
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "System Updated",
        description: "The system has been successfully updated to the latest version."
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "There was an error updating the system. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="border border-dashed p-4">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">System Update</CardTitle>
        <CardDescription>
          Update the system to the latest version from the repository
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <Button 
          variant="default" 
          className="w-full" 
          onClick={handleSystemUpdate}
          disabled={isUpdating}
        >
          <RefreshCw className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
          {isUpdating ? 'Updating...' : 'Update System'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SystemUpdateCard;
