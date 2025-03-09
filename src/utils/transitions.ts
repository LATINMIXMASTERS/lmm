
// Simple utility functions for page and component transitions

/**
 * Generate a delay string for staggered animations
 * @param index The index of the item in a list
 * @param baseDelay Base delay in seconds
 * @param staggerAmount Amount to stagger each item by in seconds
 * @returns Style object with animationDelay
 */
export const getStaggeredDelay = (
  index: number, 
  baseDelay: number = 0.1, 
  staggerAmount: number = 0.1
): React.CSSProperties => {
  return {
    animationDelay: `${baseDelay + index * staggerAmount}s`
  };
};

/**
 * Generate a random delay for more natural-looking animations
 * @param minDelay Minimum delay in seconds
 * @param maxDelay Maximum delay in seconds
 * @returns Style object with animationDelay
 */
export const getRandomDelay = (
  minDelay: number = 0, 
  maxDelay: number = 0.5
): React.CSSProperties => {
  const delay = minDelay + Math.random() * (maxDelay - minDelay);
  return {
    animationDelay: `${delay}s`
  };
};

/**
 * Simple fade-in animation classes with optional delay
 * @param delay Delay in seconds before animation starts
 * @returns Tailwind classes for animation
 */
export const fadeIn = (delay?: number): string => {
  const delayClass = delay ? `[animation-delay:${delay}s]` : '';
  return `opacity-0 animate-fade-in ${delayClass}`;
};

/**
 * Slide-up animation classes with optional delay
 * @param delay Delay in seconds before animation starts
 * @returns Tailwind classes for animation
 */
export const slideUp = (delay?: number): string => {
  const delayClass = delay ? `[animation-delay:${delay}s]` : '';
  return `opacity-0 animate-slide-up ${delayClass}`;
};

/**
 * Scale-in animation classes with optional delay
 * @param delay Delay in seconds before animation starts
 * @returns Tailwind classes for animation
 */
export const scaleIn = (delay?: number): string => {
  const delayClass = delay ? `[animation-delay:${delay}s]` : '';
  return `opacity-0 animate-scale-in ${delayClass}`;
};
