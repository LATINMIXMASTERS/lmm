
/**
 * Utility functions for image handling and manipulation
 */

/**
 * Compresses an image file to reduce its size before uploading
 * @param file The original image file to compress
 * @param options Compression options
 * @returns Promise resolving to a compressed File object
 */
export const compressImage = async (
  file: File, 
  options: { 
    maxWidthOrHeight?: number; 
    quality?: number;
    maxSizeKB?: number;
  } = {}
): Promise<File> => {
  // Set default options
  const maxWidthOrHeight = options.maxWidthOrHeight || 1200;
  const quality = options.quality || 0.7;
  const maxSizeKB = options.maxSizeKB || 800; // 800KB default max size

  // If file is already smaller than maxSizeKB, return the original file
  if (file.size <= maxSizeKB * 1024) {
    return file;
  }

  // Create an image element to load the file
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Create a canvas to draw the resized image
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > height) {
        if (width > maxWidthOrHeight) {
          height = Math.round(height * maxWidthOrHeight / width);
          width = maxWidthOrHeight;
        }
      } else {
        if (height > maxWidthOrHeight) {
          width = Math.round(width * maxWidthOrHeight / height);
          height = maxWidthOrHeight;
        }
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the resized image
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Convert canvas to blob with specified quality
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas to Blob conversion failed'));
          return;
        }
        
        // Create a new file from the blob
        const compressedFile = new File(
          [blob], 
          file.name, 
          { type: file.type, lastModified: Date.now() }
        );
        
        resolve(compressedFile);
      }, file.type, quality);
    };

    img.onerror = () => {
      reject(new Error('Error loading image for compression'));
    };

    // Load image from file
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Validates an image file, checking dimensions and size
 * @param file The image file to validate
 * @returns Promise resolving to validation result
 */
export const validateImageDimensions = (file: File): Promise<{ valid: boolean; message?: string; dimensions?: { width: number; height: number } }> => {
  return new Promise((resolve) => {
    const img = new Image();
    
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        valid: true,
        dimensions: { width: img.width, height: img.height }
      });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      resolve({
        valid: false,
        message: "Failed to load image for validation"
      });
    };
    
    img.src = URL.createObjectURL(file);
  });
};
