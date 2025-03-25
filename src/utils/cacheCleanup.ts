/**
 * Utility functions for cleaning up browser storage and cache
 * to improve application performance and free up space
 */

const STORAGE_KEYS = [
  'latinmixmasters_tracks',
  'latinmixmasters_s3config',
  'latinmixmasters_player',
  'latinmixmasters_users',
  'latinmixmasters_stations'
];

/**
 * Clean up localStorage items that are no longer needed
 * or exceed certain size constraints
 */
export const cleanupLocalStorage = (): { 
  success: boolean; 
  cleanedItems: number;
  bytesFreed: number;
} => {
  try {
    let cleanedItems = 0;
    let bytesFreed = 0;
    
    // Get total localStorage usage
    const totalBefore = calculateStorageUsage();
    
    // Clean up tracks
    const tracksData = localStorage.getItem('latinmixmasters_tracks');
    if (tracksData && tracksData.length > 1000000) { // If more than ~1MB
      const tracks = JSON.parse(tracksData);
      // Keep only the most recent 20 tracks
      const reducedTracks = tracks.slice(-20);
      const newTracksData = JSON.stringify(reducedTracks);
      localStorage.setItem('latinmixmasters_tracks', newTracksData);
      
      bytesFreed += tracksData.length - newTracksData.length;
      cleanedItems++;
    }
    
    // Remove old and unnecessary caches
    const cacheKeys = Object.keys(localStorage).filter(key => 
      !STORAGE_KEYS.includes(key) && 
      (key.includes('cache') || key.includes('temp') || key.endsWith('_old'))
    );
    
    cacheKeys.forEach(key => {
      const size = localStorage.getItem(key)?.length || 0;
      localStorage.removeItem(key);
      bytesFreed += size;
      cleanedItems++;
    });
    
    // Calculate freed space
    const totalAfter = calculateStorageUsage();
    
    console.log(`Storage cleanup complete: ${formatBytes(totalBefore - totalAfter)} freed`);
    
    return {
      success: true,
      cleanedItems,
      bytesFreed
    };
  } catch (error) {
    console.error('Error cleaning up storage:', error);
    return {
      success: false,
      cleanedItems: 0,
      bytesFreed: 0
    };
  }
};

/**
 * Calculate the total storage usage in bytes
 */
export const calculateStorageUsage = (): number => {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      total += key.length + value.length;
    }
  }
  return total;
};

/**
 * Format bytes to human readable format
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Clear application cache and storage
 * This includes:
 * - localStorage cleanup
 * - Cached images
 * - Audio buffer cache
 */
export const clearApplicationCache = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // Clean up localStorage
    const storageResult = cleanupLocalStorage();
    
    // Clear IndexedDB if available
    await clearIndexedDB();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Try to clear browser cache via the Cache API if available
    let cacheCleared = false;
    if ('caches' in window) {
      try {
        const cacheNames = await window.caches.keys();
        await Promise.all(
          cacheNames.map(name => window.caches.delete(name))
        );
        cacheCleared = true;
      } catch (e) {
        console.warn('Could not clear browser caches:', e);
      }
    }
    
    return {
      success: true,
      message: `Successfully cleaned up ${storageResult.cleanedItems} items (${formatBytes(storageResult.bytesFreed)}). ${
        cacheCleared ? 'Browser cache also cleared.' : 'Browser cache API not available.'
      }`
    };
  } catch (error) {
    console.error('Error clearing application cache:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error clearing cache'
    };
  }
};

/**
 * Clear IndexedDB databases
 */
const clearIndexedDB = async (): Promise<void> => {
  if (!('indexedDB' in window)) return;
  
  return new Promise((resolve) => {
    const databases = indexedDB.databases ? indexedDB.databases() : Promise.resolve([]);
    databases.then((dbs) => {
      const deletePromises = dbs.map(db => {
        if (!db.name) return Promise.resolve();
        return new Promise<void>((resolveDelete) => {
          const request = indexedDB.deleteDatabase(db.name!);
          request.onsuccess = () => resolveDelete();
          request.onerror = () => resolveDelete();
        });
      });
      
      Promise.all(deletePromises).then(() => resolve());
    }).catch(() => resolve()); // Resolve even if listing databases fails
  });
};
