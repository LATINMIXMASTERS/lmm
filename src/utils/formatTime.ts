
/**
 * Formats a duration in seconds to MM:SS format
 */
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '00:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Formats a duration in seconds to MM:SS format (alias for formatDuration)
 */
export const formatTime = formatDuration;
