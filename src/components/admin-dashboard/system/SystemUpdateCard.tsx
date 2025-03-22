
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { RefreshCw, Globe, Clipboard, Check, Terminal, Server } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateScripts, copyToClipboard } from './updateScripts';

const SystemUpdateCard: React.FC = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [secretToken, setSecretToken] = useState('');
  const [scriptType, setScriptType] = useState<'standard' | 'pm2'>('standard');
  const [copied, setCopied] = useState(false);

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

  const handleCopyScript = async () => {
    const success = await copyToClipboard(updateScripts[scriptType]);
    if (success) {
      setCopied(true);
      toast({
        title: "Script Copied",
        description: "Update script has been copied to clipboard. You can paste it into your server's terminal."
      });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast({
        title: "Copy Failed",
        description: "Failed to copy script to clipboard. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border border-dashed p-4 h-full">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">System Update</CardTitle>
        <CardDescription>
          Trigger system update on your VPS via webhook or manual script
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <Tabs defaultValue="webhook" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="webhook">Webhook Update</TabsTrigger>
            <TabsTrigger value="manual">Manual Update</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook" className="space-y-4">
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
              <p className="text-xs text-muted-foreground">
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
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Server Type
              </label>
              <div className="flex space-x-2">
                <Button 
                  variant={scriptType === 'standard' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setScriptType('standard')}
                >
                  <Server className="w-4 h-4 mr-2" />
                  Systemd
                </Button>
                <Button 
                  variant={scriptType === 'pm2' ? 'default' : 'outline'} 
                  className="flex-1"
                  onClick={() => setScriptType('pm2')}
                >
                  <Terminal className="w-4 h-4 mr-2" />
                  PM2
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Manual Update Script
              </label>
              <div className="relative">
                <pre className="p-4 rounded-md bg-muted text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  {updateScripts[scriptType]}
                </pre>
                <Button 
                  size="sm" 
                  className="absolute top-2 right-2" 
                  onClick={handleCopyScript}
                  variant="secondary"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 mr-1" /> Copied</>
                  ) : (
                    <><Clipboard className="w-4 h-4 mr-1" /> Copy</>
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this script and run it on your VPS to update manually
              </p>
            </div>
            
            <div className="p-3 rounded-md bg-muted">
              <h4 className="text-sm font-medium mb-2">Manual Update Instructions:</h4>
              <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
                <li>SSH into your server: <code>ssh user@your-server</code></li>
                <li>Navigate to your application directory: <code>cd /var/www/latinmixmasters</code></li>
                <li>Copy the script above into a file: <code>nano update.sh</code></li>
                <li>Make the script executable: <code>chmod +x update.sh</code></li>
                <li>Run the script: <code>./update.sh</code></li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemUpdateCard;
