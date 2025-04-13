
/**
 * Normalizes a volume value to be within the valid range for HTML media elements (0-1)
 * @param volume Volume value (can be in 0-100 range or 0-1 range)
 * @returns Normalized volume in 0-1 range
 */
export const normalizeVolume = (volume: number): number => {
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
  // Convert from 0-1 range to 0-100 range if needed
  const displayVolume = volume <= 1 ? Math.round(volume * 100) : volume;
  
  // Ensure the value is within the valid range
  return Math.max(0, Math.min(100, Math.round(displayVolume)));
};
