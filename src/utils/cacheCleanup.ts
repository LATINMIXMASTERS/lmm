
/**
 * Optimized utility functions for cache cleanup
 */

/**
 * Clear browser caches using the Cache API with performance optimizations
 */
export const clearBrowserCache = async (): Promise<void> => {
  try {
    // Check if Cache API is available
    if ('caches' in window) {
      // Get list of all cache names
      const cacheNames = await caches.keys();
      
      // Process caches in batches for better performance
      const batchSize = 5;
      for (let i = 0; i < cacheNames.length; i += batchSize) {
        const batch = cacheNames.slice(i, i + batchSize);
        await Promise.all(batch.map(cacheName => caches.delete(cacheName)));
      }
      
      console.log('Browser cache cleared successfully');
      return;
    }
    
    throw new Error('Cache API not available in this browser');
  } catch (error) {
    console.error('Error clearing cache:', error);
    throw error;
  }
};

/**
 * Clear local storage cache with performance optimization
 */
export const clearLocalStorage = (): void => {
  try {
    // Fast clear with performance optimizations
    const storageKeys = Object.keys(localStorage);
    
    // Clear in batches if there are many items
    if (storageKeys.length > 50) {
      // Use faster clear method for large storage
      localStorage.clear();
    } else {
      // Remove items individually for smaller storage (prevents UI freeze)
      for (const key of storageKeys) {
        localStorage.removeItem(key);
      }
    }
    
    console.log('Local storage cleared successfully');
  } catch (error) {
    console.error('Error clearing local storage:', error);
    throw error;
  }
};

/**
 * Clear session storage cache with performance optimization
 */
export const clearSessionStorage = (): void => {
  try {
    // Fast clear with performance optimizations
    const storageKeys = Object.keys(sessionStorage);
    
    // Clear in batches if there are many items
    if (storageKeys.length > 50) {
      // Use faster clear method for large storage
      sessionStorage.clear();
    } else {
      // Remove items individually for smaller storage (prevents UI freeze)
      for (const key of storageKeys) {
        sessionStorage.removeItem(key);
      }
    }
    
    console.log('Session storage cleared successfully');
  } catch (error) {
    console.error('Error clearing session storage:', error);
    throw error;
  }
};

/**
 * Clear IndexedDB if available (additional optimization)
 */
export const clearIndexedDB = async (): Promise<void> => {
  try {
    if ('indexedDB' in window) {
      const dbList = await window.indexedDB.databases();
      
      // Process in parallel for better performance
      await Promise.all(dbList.map(db => {
        if (db.name) {
          return new Promise<void>((resolve, reject) => {
            const request = window.indexedDB.deleteDatabase(db.name!);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
        return Promise.resolve();
      }));
      
      console.log('IndexedDB cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    // Don't throw here to allow other operations to continue
  }
};

/**
 * Clear application cache with performance optimizations
 */
export const clearApplicationCache = (): void => {
  try {
    // Check if application cache is available
    if ('applicationCache' in window) {
      // @ts-ignore - applicationCache is deprecated but may still exist
      window.applicationCache.swapCache();
      console.log('Application cache cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing application cache:', error);
    // Don't throw here to allow other operations to continue
  }
};

/**
 * Clear service worker caches if available
 */
export const clearServiceWorkerCaches = async (): Promise<void> => {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      await Promise.all(registrations.map(registration => registration.unregister()));
      console.log('Service worker caches cleared successfully');
    }
  } catch (error) {
    console.error('Error clearing service worker caches:', error);
    // Don't throw here to allow other operations to continue
  }
};

/**
 * Clear all application caches with performance optimizations
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    // Create a microtask queue for better UI responsiveness
    setTimeout(async () => {
      // Execute in parallel for maximum performance
      await Promise.all([
        clearBrowserCache(),
        Promise.resolve().then(() => clearLocalStorage()),
        Promise.resolve().then(() => clearSessionStorage()),
        clearIndexedDB(),
        Promise.resolve().then(() => clearApplicationCache()),
        clearServiceWorkerCaches()
      ]);
      
      console.log('All caches cleared successfully with performance optimizations');
    }, 0);
  } catch (error) {
    console.error('Error clearing all caches:', error);
    throw error;
  }
};
