
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { copyToClipboard } from './updateScripts';
import WebhookUpdateTab from './WebhookUpdateTab';
import ManualUpdateTab from './ManualUpdateTab';

const SystemUpdateCard: React.FC = () => {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSystemUpdate = async (webhookUrl: string, secretToken: string) => {
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

  const handleCopyScript = async (script: string) => {
    const success = await copyToClipboard(script);
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
    <Card className="border border-dashed p-4 h-full shadow-sm bg-card text-card-foreground">
      <CardHeader className="p-3">
        <CardTitle className="text-lg text-foreground">System Update</CardTitle>
        <CardDescription className="text-muted-foreground">
          Trigger system update on your VPS via webhook or manual script
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3 space-y-4">
        <Tabs defaultValue="webhook" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="webhook">Webhook Update</TabsTrigger>
            <TabsTrigger value="manual">Manual Update</TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook">
            <WebhookUpdateTab 
              onUpdate={handleSystemUpdate}
              isUpdating={isUpdating}
            />
          </TabsContent>
          
          <TabsContent value="manual">
            <ManualUpdateTab 
              onCopyScript={handleCopyScript} 
              copied={copied} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SystemUpdateCard;
