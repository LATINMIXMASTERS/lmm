
/**
 * Utility functions for cache cleanup
 */

/**
 * Clear browser caches using the Cache API
 */
export const clearBrowserCache = async (): Promise<void> => {
  try {
    // Check if Cache API is available
    if ('caches' in window) {
      // Get list of all cache names
      const cacheNames = await caches.keys();
      
      // Delete each cache
      const deletionPromises = cacheNames.map(cacheName => 
        caches.delete(cacheName)
      );
      
      // Wait for all deletions to complete
      await Promise.all(deletionPromises);
      
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
 * Clear local storage cache
 */
export const clearLocalStorage = (): void => {
  try {
    localStorage.clear();
    console.log('Local storage cleared successfully');
  } catch (error) {
    console.error('Error clearing local storage:', error);
    throw error;
  }
};

/**
 * Clear session storage cache
 */
export const clearSessionStorage = (): void => {
  try {
    sessionStorage.clear();
    console.log('Session storage cleared successfully');
  } catch (error) {
    console.error('Error clearing session storage:', error);
    throw error;
  }
};

/**
 * Clear all application caches
 */
export const clearAllCaches = async (): Promise<void> => {
  try {
    await clearBrowserCache();
    clearLocalStorage();
    clearSessionStorage();
    console.log('All caches cleared successfully');
  } catch (error) {
    console.error('Error clearing all caches:', error);
    throw error;
  }
};
