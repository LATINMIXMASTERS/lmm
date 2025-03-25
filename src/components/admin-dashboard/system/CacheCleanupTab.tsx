
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Trash2, RotateCcw, Check, AlertTriangle } from 'lucide-react';
import { clearApplicationCache, calculateStorageUsage, formatBytes } from '@/utils/cacheCleanup';
import { useToast } from '@/hooks/use-toast';

const CacheCleanupTab: React.FC = () => {
  const [isCleaning, setIsCleaning] = useState(false);
  const [storageUsage, setStorageUsage] = useState<string | null>(null);
  const [lastCleanupResult, setLastCleanupResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const { toast } = useToast();
  
  // Calculate current storage usage
  const calculateCurrentUsage = () => {
    const bytes = calculateStorageUsage();
    setStorageUsage(formatBytes(bytes));
  };
  
  // Run cleanup process
  const handleCleanup = async () => {
    setIsCleaning(true);
    
    try {
      // Get storage usage before cleanup
      const beforeBytes = calculateStorageUsage();
      
      // Perform cleanup
      const result = await clearApplicationCache();
      
      // Get storage usage after cleanup
      const afterBytes = calculateStorageUsage();
      const freedBytes = beforeBytes - afterBytes;
      
      // Update state with result
      setLastCleanupResult({
        success: result.success,
        message: result.message
      });
      
      // Update storage usage display
      setStorageUsage(formatBytes(afterBytes));
      
      // Show toast notification
      toast({
        title: result.success ? "Cache Cleanup Successful" : "Cache Cleanup Failed",
        description: result.success 
          ? `Freed up ${formatBytes(freedBytes)} of storage space.`
          : result.message,
        variant: result.success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error during cache cleanup:', error);
      setLastCleanupResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error during cleanup'
      });
      
      toast({
        title: "Cache Cleanup Failed",
        description: "An unexpected error occurred during cleanup.",
        variant: "destructive"
      });
    } finally {
      setIsCleaning(false);
    }
  };
  
  // Check storage usage when component mounts
  React.useEffect(() => {
    calculateCurrentUsage();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Trash2 className="mr-2 h-5 w-5 text-muted-foreground" />
          Cache & Storage Cleanup
        </CardTitle>
        <CardDescription>
          Clear browser storage and caches to improve application performance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-4 bg-muted rounded-md">
          <div>
            <p className="font-medium">Current Storage Usage</p>
            <p className="text-muted-foreground">{storageUsage || 'Calculating...'}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={calculateCurrentUsage}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
        
        {lastCleanupResult && (
          <Alert variant={lastCleanupResult.success ? "default" : "destructive"}>
            {lastCleanupResult.success ? (
              <Check className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <AlertTitle>
              {lastCleanupResult.success ? "Cleanup Successful" : "Cleanup Failed"}
            </AlertTitle>
            <AlertDescription>
              {lastCleanupResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Clearing the cache can help fix storage quota errors and improve application performance.
            This will remove unused data and temporary files.
          </p>
          
          <Button 
            onClick={handleCleanup} 
            disabled={isCleaning}
            className="w-full"
          >
            {isCleaning ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Clean Up Cache & Storage
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CacheCleanupTab;
