
/**
 * Fetch with timeout to avoid hanging requests
 */
export const fetchWithTimeout = (url: string, options: RequestInit = {}, timeout = 5000): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error(`Request timeout for ${url}`));
    }, timeout);
    
    fetch(url, { ...options, signal })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
};
