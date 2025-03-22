
import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CoverImageUploadProps {
  coverPreview: string;
  setCoverPreview: (preview: string) => void;
  setCoverImage: (file: File | null) => void;
}

const CoverImageUpload: React.FC<CoverImageUploadProps> = ({
  coverPreview,
  setCoverPreview,
  setCoverImage
}) => {
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  // Handle cover image selection
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (event) => {
        setCoverPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>Cover Image</Label>
      <div className="flex items-center gap-4">
        {coverPreview ? (
          <div className="relative w-32 h-32 rounded-md overflow-hidden">
            <img
              src={coverPreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-1 right-1 w-6 h-6"
              onClick={() => {
                setCoverPreview('');
                setCoverImage(null);
                if (coverInputRef.current) coverInputRef.current.value = '';
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="h-32 w-32"
            onClick={() => coverInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <Upload className="h-8 w-8 mb-2" />
              <span>Upload cover</span>
            </div>
          </Button>
        )}
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CoverImageUpload;
