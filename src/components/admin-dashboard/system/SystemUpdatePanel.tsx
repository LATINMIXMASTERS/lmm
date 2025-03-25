
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Download, Globe, Trash2 } from 'lucide-react';
import WebhookUpdateTab from './WebhookUpdateTab';
import ManualUpdateTab from './ManualUpdateTab';
import CacheCleanupTab from './CacheCleanupTab';

const SystemUpdatePanel: React.FC = () => {
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
            </TabsList>
            
            <TabsContent value="webhook">
              <WebhookUpdateTab />
            </TabsContent>
            
            <TabsContent value="manual">
              <ManualUpdateTab />
            </TabsContent>
            
            <TabsContent value="cache">
              <CacheCleanupTab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemUpdatePanel;
