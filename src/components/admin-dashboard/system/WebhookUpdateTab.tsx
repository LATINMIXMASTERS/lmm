
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WebhookUpdateTabProps {
  onUpdate: (url: string, token: string) => Promise<void>;
  isUpdating: boolean;
}

const WebhookUpdateTab: React.FC<WebhookUpdateTabProps> = ({ onUpdate, isUpdating }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretToken, setSecretToken] = useState('');
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL Required",
        description: "Please enter the webhook URL to trigger the system update.",
        variant: "destructive"
      });
      return;
    }
    
    await onUpdate(webhookUrl, secretToken);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="webhookUrl" className="text-sm font-medium text-foreground">
          Webhook URL
        </label>
        <Input
          id="webhookUrl"
          placeholder="https://your-domain.com/hooks/update-app"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          disabled={isUpdating}
          className="bg-background text-foreground"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="secretToken" className="text-sm font-medium text-foreground">
          Secret Token (Optional)
        </label>
        <Input
          id="secretToken"
          placeholder="your-secret-token"
          type="password"
          value={secretToken}
          onChange={(e) => setSecretToken(e.target.value)}
          disabled={isUpdating}
          className="bg-background text-foreground"
        />
        <p className="text-xs text-muted-foreground">
          This will be sent as the Authorization header
        </p>
      </div>
      
      <Button 
        variant="default" 
        className="w-full" 
        onClick={handleUpdate}
        disabled={isUpdating}
      >
        <RefreshCw className={`mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
        {isUpdating ? 'Updating...' : 'Update System'}
      </Button>
    </div>
  );
};

export default WebhookUpdateTab;
