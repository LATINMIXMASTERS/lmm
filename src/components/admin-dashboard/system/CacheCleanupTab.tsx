
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Check, RefreshCw, Database, Package, Box } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  clearBrowserCache, 
  clearLocalStorage, 
  clearSessionStorage,
  clearAllCaches,
  clearIndexedDB,
  clearServiceWorkerCaches 
} from '@/utils/cacheCleanup';

const CacheCleanupTab: React.FC = () => {
  const [isCleaning, setIsCleaning] = useState<Record<string, boolean>>({
    browser: false,
    local: false,
    session: false,
    indexed: false,
    service: false,
    all: false
  });
  
  const [isSuccess, setIsSuccess] = useState<Record<string, boolean>>({
    browser: false,
    local: false,
    session: false,
    indexed: false,
    service: false,
    all: false
  });
  
  const { toast } = useToast();

  const resetSuccessState = (key: string) => {
    setTimeout(() => {
      setIsSuccess(prev => ({ ...prev, [key]: false }));
    }, 3000);
  };

  const handleClearCache = async (cacheType: string) => {
    setIsCleaning(prev => ({ ...prev, [cacheType]: true }));
    setIsSuccess(prev => ({ ...prev, [cacheType]: false }));
    
    try {
      switch (cacheType) {
        case 'browser':
          await clearBrowserCache();
          toast({
            title: "Browser Cache Cleared",
            description: "Application browser cache has been successfully cleared.",
          });
          break;
        case 'local':
          clearLocalStorage();
          toast({
            title: "Local Storage Cleared",
            description: "Local storage has been successfully cleared.",
          });
          break;
        case 'session':
          clearSessionStorage();
          toast({
            title: "Session Storage Cleared",
            description: "Session storage has been successfully cleared.",
          });
          break;
        case 'indexed':
          await clearIndexedDB();
          toast({
            title: "IndexedDB Cleared",
            description: "IndexedDB storage has been successfully cleared.",
          });
          break;
        case 'service':
          await clearServiceWorkerCaches();
          toast({
            title: "Service Workers Cleared",
            description: "Service worker caches have been successfully cleared.",
          });
          break;
        case 'all':
          await clearAllCaches();
          toast({
            title: "All Caches Cleared",
            description: "All application caches have been successfully cleared.",
          });
          break;
      }
      
      setIsSuccess(prev => ({ ...prev, [cacheType]: true }));
      resetSuccessState(cacheType);
    } catch (error) {
      console.error(`Cache clearing error (${cacheType}):`, error);
      toast({
        title: `Failed to Clear ${cacheType} Cache`,
        description: error instanceof Error ? error.message : "There was an error clearing the cache.",
        variant: "destructive"
      });
    } finally {
      setIsCleaning(prev => ({ ...prev, [cacheType]: false }));
    }
  };

  const renderCacheButton = (type: string, label: string, icon: React.ReactNode) => (
    <div className="flex justify-between items-center p-3 border rounded-md bg-background">
      <div>
        <h5 className="text-sm font-medium">{label}</h5>
        <p className="text-xs text-muted-foreground">
          Clears {type.toLowerCase()} cache data
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => handleClearCache(type.toLowerCase())}
        disabled={isCleaning[type.toLowerCase()]}
        className={isSuccess[type.toLowerCase()] ? "bg-green-500 text-white hover:bg-green-600" : ""}
      >
        {isCleaning[type.toLowerCase()] ? (
          <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
        ) : isSuccess[type.toLowerCase()] ? (
          <Check className="h-4 w-4 mr-1" />
        ) : (
          icon
        )}
        {isCleaning[type.toLowerCase()] ? "Clearing..." : isSuccess[type.toLowerCase()] ? "Cleared" : `Clear ${type}`}
      </Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="p-4 bg-muted rounded-md">
        <h4 className="font-medium mb-2">Cache Management</h4>
        <p className="text-sm text-muted-foreground mb-4">
          Clear different types of application caches to resolve issues with outdated data or to free up storage space.
        </p>
        
        <div className="space-y-3">
          {renderCacheButton("Browser", "Browser Cache", <Trash2 className="h-4 w-4 mr-1" />)}
          {renderCacheButton("Local", "Local Storage", <Database className="h-4 w-4 mr-1" />)}
          {renderCacheButton("Session", "Session Storage", <Box className="h-4 w-4 mr-1" />)}
          {renderCacheButton("Indexed", "IndexedDB Storage", <Package className="h-4 w-4 mr-1" />)}
          {renderCacheButton("Service", "Service Workers", <RefreshCw className="h-4 w-4 mr-1" />)}
          
          <div className="mt-4 pt-4 border-t">
            {renderCacheButton("All", "All Application Caches", <Trash2 className="h-4 w-4 mr-1" />)}
          </div>
          
          <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 mt-4">
            <h5 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">Performance Tips</h5>
            <ul className="list-disc list-inside text-xs text-yellow-700 dark:text-yellow-400 space-y-1">
              <li>Clear caches regularly to improve application performance</li>
              <li>After clearing caches, you may need to refresh the page</li>
              <li>For server-side caches, use the update scripts in the Manual Update tab</li>
              <li>Consider setting up automated cache clearing for optimal performance</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheCleanupTab;
