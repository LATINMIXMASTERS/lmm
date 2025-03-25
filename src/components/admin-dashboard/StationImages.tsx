
import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/models/RadioStation';
import { StationImageCard } from './station-images';

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
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file (JPEG, PNG, etc.)",
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image size should be less than 2MB",
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
        await uploadStationImage(stationId, upload.file);
        
        toast({
          title: "Station Image Updated",
          description: "The station cover image has been uploaded successfully."
        });
        
        handleClearStationImageUpload(stationId);
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
            <div className="text-sm text-blue-800">
              These images will be displayed on the stations page and in the player when the station is playing.
              <br/>
              <strong>Note:</strong> For best results, use high-quality images with a 16:9 aspect ratio. Maximum file size: 2MB.
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
