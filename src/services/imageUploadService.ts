
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

// Convert file to data URL
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve(dataUrl);
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
};

// Validate an image file
export const validateImageFile = (file: File): { valid: boolean; message?: string } => {
  if (!file) {
    return { valid: false, message: "No file was selected for upload" };
  }
  
  // Check if the file is an image
  if (!file.type.startsWith('image/')) {
    return { valid: false, message: "The selected file is not an image" };
  }
  
  // Check if the file size is reasonable (less than 5MB)
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, message: "The image file is too large (max 5MB)" };
  }
  
  return { valid: true };
};
