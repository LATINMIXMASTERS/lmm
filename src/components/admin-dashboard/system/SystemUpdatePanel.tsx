
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Download, Globe, Trash2, FileText } from 'lucide-react';
import WebhookUpdateTab from './WebhookUpdateTab';
import ManualUpdateTab from './ManualUpdateTab';
import CacheCleanupTab from './CacheCleanupTab';
import InstructionsGenerator from './InstructionsGenerator';
import { useToast } from '@/hooks/use-toast';
import { updateScripts, copyToClipboard } from './updateScripts';

const SystemUpdatePanel: React.FC = () => {
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Settings className="mr-2 h-6 w-6 text-muted-foreground" />
            System Maintenance
          </CardTitle>
          <CardDescription>
            Manage system updates, maintenance, and performance optimization
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="webhook" className="space-y-4">
            <TabsList>
              <TabsTrigger value="webhook" className="flex items-center">
                <Globe className="mr-2 h-4 w-4" />
                Webhook Updates
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center">
                <Download className="mr-2 h-4 w-4" />
                Manual Updates
              </TabsTrigger>
              <TabsTrigger value="cache" className="flex items-center">
                <Trash2 className="mr-2 h-4 w-4" />
                Cache Cleanup
              </TabsTrigger>
              <TabsTrigger value="instructions" className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Installation Guide
              </TabsTrigger>
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
            
            <TabsContent value="cache">
              <CacheCleanupTab />
            </TabsContent>
            
            <TabsContent value="instructions">
              <InstructionsGenerator />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemUpdatePanel;
