
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { clearBrowserCache } from '@/utils/cacheCleanup';

const CacheCleanupTab: React.FC = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();

  const handleClearCache = async () => {
    setIsCleaning(true);
    setIsSuccess(false);
    
    try {
      // Clear application cache
      await clearBrowserCache();
      
      // Show success message
      setIsSuccess(true);
      toast({
        title: "Cache Cleared",
        description: "Application cache has been successfully cleared.",
      });
      
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Cache clearing error:", error);
      toast({
        title: "Failed to Clear Cache",
        description: error instanceof Error ? error.message : "There was an error clearing the cache.",
        variant: "destructive"
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-md">
        <h4 className="font-medium mb-2">Cache Management</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Clear application cache to resolve issues with outdated data or to free up storage space on your server.
        </p>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center p-3 border rounded-md bg-background">
            <div>
              <h5 className="text-sm font-medium">Application Cache</h5>
              <p className="text-xs text-muted-foreground">
                Clears temporary files and application cache
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearCache}
              disabled={isCleaning}
              className={isSuccess ? "bg-green-500 text-white hover:bg-green-600" : ""}
            >
              {isCleaning ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : isSuccess ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1" />
              )}
              {isCleaning ? "Clearing..." : isSuccess ? "Cleared" : "Clear Cache"}
            </Button>
          </div>
          
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
            <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Server Maintenance Tips</h5>
            <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>Clear server-side cache regularly to improve performance</li>
              <li>Use the update scripts in the Manual Update tab for full system updates</li>
              <li>Consider setting up a cron job for automated updates</li>
              <li>Monitor server disk space to prevent storage issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheCleanupTab;
