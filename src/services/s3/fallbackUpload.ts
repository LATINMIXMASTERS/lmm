
import { S3UploadResult } from './types';

/**
 * Fallback upload method when S3 fails or is not configured
 * Stores files in localStorage (used only for demo/development)
 */
export const uploadToLocalStorage = async (
  file: File,
  folder: string = 'audio',
  onProgress?: (progress: number) => void
): Promise<S3UploadResult> => {
  try {
    // Start progress
    if (onProgress) onProgress(10);
    
    // Convert file to data URL
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    
    // Update progress
    if (onProgress) onProgress(50);
    
    // Generate a unique ID for the file
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileId = `${timestamp}-${randomString}`;
    
    // Create a safe filename
    const fileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filePath = `${folder}/${fileId}-${fileName}`;
    
    // Store in localStorage (this is not suitable for large files in production)
    const storage = JSON.parse(localStorage.getItem('latinmixmasters_files') || '{}');
    storage[filePath] = {
      dataUrl,
      type: file.type,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString()
    };
    localStorage.setItem('latinmixmasters_files', JSON.stringify(storage));
    
    // Complete progress
    if (onProgress) onProgress(100);
    
    // Return success with the dataUrl
    console.log("Fallback storage used for", file.name);
    return {
      success: true,
      url: dataUrl
    };
  } catch (error) {
    console.error("Fallback upload error:", error);
    
    // Reset progress on error
    if (onProgress) onProgress(0);
    
    return {
      success: false,
      url: '',
      error: error instanceof Error ? error.message : 'Unknown upload error'
    };
  }
};
