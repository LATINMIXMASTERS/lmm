
import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/models/RadioStation';
import { StationImageCard } from './station-images';
import { compressImage } from '@/utils/imageUtils';

const StationImages: React.FC = () => {
  const { stations, updateStationImage, uploadStationImage } = useRadio();
  const { toast } = useToast();
  
  const [stationImages, setStationImages] = useState<Record<string, string>>({});
  const [stationImageUploads, setStationImageUploads] = useState<Record<string, FileUpload | null>>({});
  
  useEffect(() => {
    const initialStationImages: Record<string, string> = {};
    
    stations.forEach(station => {
      initialStationImages[station.id] = station.image || '';
    });
    
    setStationImages(initialStationImages);
  }, [stations]);
  
  const handleStationImageChange = (stationId: string, imageUrl: string) => {
    setStationImages(prev => ({
      ...prev,
      [stationId]: imageUrl
    }));
    
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
  };
  
  const handleStationImageFileChange = (stationId: string, files: FileList | null) => {
    if (!files || !files.length) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPEG, PNG, etc).",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setStationImageUploads(prev => ({
        ...prev,
        [stationId]: { file, dataUrl }
      }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleClearStationImageUpload = (stationId: string) => {
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
  };

  const handleSaveStationImage = async (stationId: string) => {
    try {
      const upload = stationImageUploads[stationId];
      
      if (upload && upload.file) {
        // Try to compress the image before uploading
        try {
          const compressedFile = await compressImage(upload.file, {
            maxWidthOrHeight: 1200,
            quality: 0.8,
            maxSizeKB: 500
          });
          
          await uploadStationImage(stationId, compressedFile);
          
          toast({
            title: "Station Image Updated",
            description: "The station cover image has been uploaded successfully."
          });
          
          handleClearStationImageUpload(stationId);
        } catch (error) {
          console.error("Failed to compress image:", error);
          // Try with the original file as fallback
          await uploadStationImage(stationId, upload.file);
          
          toast({
            title: "Station Image Updated",
            description: "The station cover image has been uploaded successfully."
          });
          
          handleClearStationImageUpload(stationId);
        }
      } else if (stationImages[stationId]) {
        const imageUrl = stationImages[stationId];
        
        if (!imageUrl) {
          toast({
            title: "Validation Error",
            description: "Image URL is required.",
            variant: "destructive"
          });
          return;
        }
        
        updateStationImage(stationId, imageUrl);
        
        toast({
          title: "Station Image Updated",
          description: "The station cover image has been updated successfully."
        });
      } else {
        toast({
          title: "No changes",
          description: "Please provide an image URL or upload a file.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update station image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ImageIcon className="w-5 h-5 mr-2 text-blue" />
            Station Cover Images
          </CardTitle>
          <CardDescription>
            Update the cover images for each radio station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 rounded-md p-3 mb-6 flex items-start">
            <ImageIcon className="w-5 h-5 text-blue mr-2 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800">For best results, use images with a <strong>16:9 aspect ratio</strong> like <strong>1280×720</strong> or <strong>1920×1080</strong> pixels.</p>
              <p className="text-sm text-blue-800 mt-1">Images will be displayed on the station page and in the player when the station is playing.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            {stations.map((station) => (
              <StationImageCard
                key={station.id}
                station={station}
                imageUrl={stationImages[station.id] || ''}
                uploadPreview={stationImageUploads[station.id] || null}
                onImageChange={handleStationImageChange}
                onFileChange={handleStationImageFileChange}
                onClearUpload={handleClearStationImageUpload}
                onSaveImage={handleSaveStationImage}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationImages;
