
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
    
    // When a URL is entered, clear any file upload for that station
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
  };
  
  const handleStationFileChange = async (stationId: string, files: FileList | null) => {
    if (!files || files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    try {
      const file = files[0];
      console.log("File selected:", file.name, file.type, file.size);
      
      // Convert to data URL for preview
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      setStationImageUploads(prev => ({
        ...prev,
        [stationId]: {
          file: file,
          dataUrl
        }
      }));
      
      // Clear any URL input when a file is uploaded
      setStationImages(prev => ({
        ...prev,
        [stationId]: ''
      }));
      
      console.log("File prepared for upload:", stationId);
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error Processing File",
        description: "There was an error preparing the file for upload. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleClearUpload = (stationId: string) => {
    setStationImageUploads(prev => ({
      ...prev,
      [stationId]: null
    }));
  };
  
  const handleSaveImage = async (stationId: string) => {
    const upload = stationImageUploads[stationId];
    const imageUrl = stationImages[stationId];
    
    if (!upload && !imageUrl) {
      toast({
        title: "No Image Selected",
        description: "Please either enter an image URL or upload an image file.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (upload?.file) {
        console.log("Uploading file for station:", stationId);
        await uploadStationImage(stationId, upload.file);
        
        // Clear the upload preview after successful upload
        setStationImageUploads(prev => ({
          ...prev,
          [stationId]: null
        }));
        
        toast({
          title: "Image Uploaded",
          description: "The station image file has been uploaded successfully.",
        });
      } else if (imageUrl) {
        console.log("Saving image URL for station:", stationId, imageUrl);
        updateStationImage(stationId, imageUrl);
        
        toast({
          title: "Image URL Saved",
          description: "The station image URL has been updated successfully.",
        });
      }
    } catch (error) {
      console.error("Error saving image:", error);
      toast({
        title: "Error Saving Image",
        description: "There was an error saving the image. Please try again.",
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
            Station Images
          </CardTitle>
          <CardDescription>
            Upload or set image URLs for each radio station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {stations.map((station) => (
              <StationImageCard
                key={station.id}
                station={station}
                imageUrl={stationImages[station.id] || ''}
                uploadPreview={stationImageUploads[station.id] || null}
                onImageChange={handleStationImageChange}
                onFileChange={handleStationFileChange}
                onClearUpload={handleClearUpload}
                onSaveImage={handleSaveImage}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationImages;
