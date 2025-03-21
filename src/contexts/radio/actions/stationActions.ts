
import { RadioState } from '../types';
import { RadioStation, FileUpload } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';

export const useStationActions = (
  state: RadioState, 
  dispatch: React.Dispatch<any>
) => {
  const { toast } = useToast();

  const updateStreamDetailsImpl = (
    stationId: string, 
    streamDetails: { url: string; port: string; password: string }
  ) => {
    dispatch({ 
      type: 'UPDATE_STREAM_DETAILS', 
      payload: { stationId, streamDetails } 
    });
    
    toast({
      title: "Stream details updated",
      description: "The streaming configuration has been saved."
    });
  };
  
  const updateStreamUrlImpl = (stationId: string, streamUrl: string) => {
    dispatch({ 
      type: 'UPDATE_STREAM_URL', 
      payload: { stationId, streamUrl } 
    });
    
    toast({
      title: "Stream URL updated",
      description: "The streaming URL has been updated."
    });
  };
  
  const updateStationImageImpl = (stationId: string, imageUrl: string) => {
    dispatch({ 
      type: 'UPDATE_STATION_IMAGE', 
      payload: { stationId, imageUrl } 
    });
    
    toast({
      title: "Station image updated",
      description: "The station image has been updated."
    });
  };
  
  const uploadStationImageImpl = async (stationId: string, file: File): Promise<void> => {
    try {
      // For demo, we're just creating a data URL - in a real app, upload to S3 or similar
      const reader = new FileReader();
      
      const promise = new Promise<string>((resolve, reject) => {
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(reader.error);
      });
      
      reader.readAsDataURL(file);
      const dataUrl = await promise;
      
      dispatch({ 
        type: 'UPDATE_STATION_IMAGE', 
        payload: { stationId, imageUrl: dataUrl } 
      });
      
      toast({
        title: "Image uploaded",
        description: "The station image has been uploaded successfully."
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the image. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const updateStationS3ImageImpl = (stationId: string, s3ImageUrl: string) => {
    dispatch({ 
      type: 'UPDATE_STATION_S3_IMAGE', 
      payload: { stationId, s3ImageUrl } 
    });
    
    toast({
      title: "Station S3 image updated",
      description: "The station S3 image reference has been updated."
    });
  };
  
  const updateStationMetadataImpl = (stationId: string, metadata: any) => {
    dispatch({ 
      type: 'UPDATE_STATION_METADATA', 
      payload: { stationId, metadata } 
    });
    
    // Don't show a toast for metadata updates - happens too frequently
    console.log(`Updated metadata for station ${stationId}:`, metadata);
  };

  return {
    updateStreamDetails: updateStreamDetailsImpl,
    updateStreamUrl: updateStreamUrlImpl,
    updateStationImage: updateStationImageImpl,
    uploadStationImage: uploadStationImageImpl,
    updateStationS3Image: updateStationS3ImageImpl,
    updateStationMetadata: updateStationMetadataImpl
  };
};
