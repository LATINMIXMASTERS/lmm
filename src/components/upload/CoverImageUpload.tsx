
import React, { useRef } from 'react';
import { Image, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface CoverImageUploadProps {
  coverPreview: string;
  setCoverPreview: (url: string) => void;
  setCoverImage: (file: File | null, previewUrl?: string) => void;
  maxFileSize?: number;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  coverPreview,
  setCoverPreview,
  setCoverImage,
  maxFileSize = 1048576 // Default 1MB
}) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > maxFileSize) {
        toast({
          title: "Image too large",
          description: "Maximum image size is 1MB",
          variant: "destructive"
        });
        return;
      }
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const previewUrl = event.target.result.toString();
          setCoverPreview(previewUrl);
          setCoverImage(file, previewUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleRemoveImage = () => {
    setCoverPreview('');
    setCoverImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>Cover Image (Max 1MB)</Label>
      <div className="flex items-center gap-4">
        {coverPreview ? (
          <div className="flex-1 bg-muted rounded-md p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 rounded-sm overflow-hidden">
                <img 
                  src={coverPreview} 
                  alt="Cover preview" 
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-medium">Cover Image</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveImage}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="flex-1 py-8"
            onClick={() => imageInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <Image className="h-8 w-8 mb-2" />
              <span>Select cover image</span>
              <span className="text-xs text-muted-foreground mt-1">JPG, PNG (max 1MB)</span>
            </div>
          </Button>
        )}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CoverImageUpload;
