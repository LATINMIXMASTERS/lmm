
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const SystemUpdateCard: React.FC = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretToken, setSecretToken] = useState('');

  const handleSystemUpdate = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter the webhook URL to trigger the system update.",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      // Call the webhook with Authorization header
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      // Add Authorization header if secret token is provided
      if (secretToken) {
        headers['Authorization'] = secretToken;
      }
      
      // Make the actual webhook request
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'update',
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
      }
      
      toast({
        title: "Update Triggered",
        description: "The system update has been triggered successfully. Check server logs for details."
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "There was an error updating the system. Please check the webhook URL and try again.",
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
          Trigger system update on your VPS via webhook
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <div className="space-y-2">
          <label htmlFor="webhookUrl" className="text-sm font-medium">
            Webhook URL
          </label>
          <Input
            id="webhookUrl"
            placeholder="https://your-domain.com/hooks/update-app"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            disabled={isUpdating}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="secretToken" className="text-sm font-medium">
            Secret Token (Optional)
          </label>
          <Input
            id="secretToken"
            placeholder="your-secret-token"
            type="password"
            value={secretToken}
            onChange={(e) => setSecretToken(e.target.value)}
            disabled={isUpdating}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This will be sent as the Authorization header
          </p>
        </div>
        
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
