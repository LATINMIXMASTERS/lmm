
/**
 * Audio utility functions for volume handling and media element operations
 */

/**
 * Normalizes a volume value to be within the valid range for HTML media elements (0-1)
 * @param volume Volume value (can be in 0-100 range or 0-1 range)
 * @returns Normalized volume in 0-1 range
 */
export const normalizeVolume = (volume: number): number => {
  // Handle invalid inputs
  if (volume === undefined || volume === null || isNaN(volume)) {
    console.warn('Invalid volume value provided:', volume);
    return 0;
  }
  
  // Convert from 0-100 range to 0-1 range if needed
  const normalizedVolume = volume > 1 ? volume / 100 : volume;
  
  // Ensure the value is within the valid range
  return Math.max(0, Math.min(1, normalizedVolume));
};

/**
 * Formats a volume value for display (ensures 0-100 range)
 * @param volume Volume value (can be in 0-100 range or 0-1 range)
 * @returns Display-ready volume in 0-100 range
 */
export const formatVolumeForDisplay = (volume: number): number => {
  // Handle invalid inputs
  if (volume === undefined || volume === null || isNaN(volume)) {
    console.warn('Invalid volume value provided:', volume);
    return 0;
  }
  
  // Convert from 0-1 range to 0-100 range if needed
  const displayVolume = volume <= 1 ? Math.round(volume * 100) : Math.round(volume);
  
  // Ensure the value is within the valid range
  return Math.max(0, Math.min(100, displayVolume));
};

/**
 * Safely applies volume to an HTML audio or video element
 * @param element HTML audio or video element
 * @param volume Volume value (can be in 0-100 range or 0-1 range)
 * @param isMuted Mute state
 */
export const applyVolumeToElement = (
  element: HTMLAudioElement | HTMLVideoElement | null,
  volume: number,
  isMuted: boolean
): void => {
  if (!element) return;
  
  try {
    // Normalize volume to 0-1 range
    const safeVolume = normalizeVolume(volume);
    
    // Apply volume and mute settings
    element.volume = safeVolume;
    element.muted = isMuted;
  } catch (error) {
    console.error(`Failed to set volume (${volume}) on media element:`, error);
  }
};
