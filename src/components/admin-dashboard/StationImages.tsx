
import React, { useState, useEffect, useRef } from 'react';
import { ImageIcon, Upload, X } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/models/RadioStation';

const StationImages: React.FC = () => {
  const { stations, updateStationImage, uploadStationImage } = useRadio();
  const { toast } = useToast();
  
  const [stationImages, setStationImages] = useState<Record<string, string>>({});
  const [stationImageUploads, setStationImageUploads] = useState<Record<string, FileUpload | null>>({});
  
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  
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
    
    if (fileInputRefs.current[stationId]) {
      fileInputRefs.current[stationId]!.value = '';
    }
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

  const triggerFileInputClick = (stationId: string) => {
    if (fileInputRefs.current[stationId]) {
      fileInputRefs.current[stationId]!.click();
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
              <div key={station.id} className="p-4 border rounded-md">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-lg">{station.name}</h3>
                  <span className="text-sm text-gray-500">{station.genre}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                  <div>
                    <div className="mb-4">
                      <Label className="mb-2 block">Image Upload</Label>
                      <div className="flex items-center gap-2">
                        <Button 
                          type="button"
                          variant="outline"
                          onClick={() => triggerFileInputClick(station.id)}
                          className="w-full flex justify-center py-6 border-dashed"
                        >
                          <Upload className="w-5 h-5 mr-2" />
                          Choose Image File
                        </Button>
                        <input
                          type="file"
                          id={`file-upload-${station.id}`}
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleStationImageFileChange(station.id, e.target.files)}
                          ref={(el) => fileInputRefs.current[station.id] = el}
                        />
                      </div>
                    </div>
                    
                    {stationImageUploads[station.id] && (
                      <div className="mt-2 mb-4 flex items-center gap-2">
                        <div className="flex-1 bg-blue-50 rounded p-2 flex items-center">
                          <div className="w-8 h-8 mr-2 rounded overflow-hidden">
                            <img 
                              src={stationImageUploads[station.id]?.dataUrl} 
                              alt="Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-sm truncate">
                            {stationImageUploads[station.id]?.file.name}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleClearStationImageUpload(station.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`station-image-${station.id}`} className="mb-2 block">
                        Or Enter Image URL
                      </Label>
                      <Input
                        id={`station-image-${station.id}`}
                        value={stationImages[station.id] || ''}
                        onChange={(e) => handleStationImageChange(station.id, e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className="w-full"
                        disabled={!!stationImageUploads[station.id]}
                      />
                      <p className="text-xs text-gray-500">
                        {stationImageUploads[station.id] 
                          ? "URL input is disabled while a file is selected for upload" 
                          : "Enter a URL for the station cover image"}
                      </p>
                    </div>
                    
                    <Button 
                      onClick={() => handleSaveStationImage(station.id)}
                      className="mt-4 bg-blue hover:bg-blue-dark w-full"
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Save Image
                    </Button>
                  </div>
                  
                  <div className="bg-gray-100 rounded-md p-4 flex justify-center">
                    <div className="aspect-video w-full max-w-[300px] rounded overflow-hidden border">
                      {stationImageUploads[station.id]?.dataUrl ? (
                        <img 
                          src={stationImageUploads[station.id]?.dataUrl} 
                          alt={`${station.name} cover preview`}
                          className="w-full h-full object-cover"
                        />
                      ) : stationImages[station.id] ? (
                        <img 
                          src={stationImages[station.id]} 
                          alt={`${station.name} cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : station.image ? (
                        <img 
                          src={station.image} 
                          alt={`${station.name} current cover`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <ImageIcon className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationImages;
