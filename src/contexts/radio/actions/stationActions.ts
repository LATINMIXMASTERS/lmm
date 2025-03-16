
import { useToast } from '@/hooks/use-toast';
import { RadioStation } from '@/models/RadioStation';
import { formatStreamUrl } from '@/utils/radioUtils';
import { validateImageFile, fileToDataUrl } from '@/services/imageUploadService';

export const useStationActions = (
  state: { stations: RadioStation[] }, 
  dispatch: React.Dispatch<any>
) => {
  const { toast } = useToast();

  const updateStreamDetailsImpl = (stationId: string, streamDetails: { url: string; port: string; password: string; }) => {
    dispatch({ 
      type: 'UPDATE_STREAM_DETAILS', 
      payload: { stationId, streamDetails } 
    });
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId ? { 
        ...station, 
        streamDetails: { 
          ...streamDetails, 
          url: formatStreamUrl(streamDetails.url) 
        }
      } : station
    );
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated stream details for station ${stationId}:`, { 
      ...streamDetails, 
      url: formatStreamUrl(streamDetails.url) 
    });
  };
  
  const updateStreamUrlImpl = (stationId: string, streamUrl: string) => {
    dispatch({ 
      type: 'UPDATE_STREAM_URL', 
      payload: { stationId, streamUrl } 
    });
    
    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { 
          ...station, 
          streamUrl: formatStreamUrl(streamUrl) 
        };
      }
      return station;
    });
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated player stream URL for station ${stationId}:`, formatStreamUrl(streamUrl));
  };
  
  const updateStationImageImpl = (stationId: string, imageUrl: string) => {
    if (!imageUrl.trim()) return;
    
    dispatch({ 
      type: 'UPDATE_STATION_IMAGE', 
      payload: { stationId, imageUrl } 
    });
    
    const updatedStations = state.stations.map(station => {
      if (station.id === stationId) {
        return { ...station, image: imageUrl };
      }
      return station;
    });
    
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    console.log(`Updated station image for station ${stationId}:`, imageUrl);
  };
  
  const uploadStationImageImpl = async (stationId: string, file: File): Promise<void> => {
    const validation = validateImageFile(file);
    
    if (!validation.valid) {
      toast({
        title: "Upload Error",
        description: validation.message,
        variant: "destructive"
      });
      return;
    }
    
    try {
      const dataUrl = await fileToDataUrl(file);
      
      // Update the station with the data URL
      updateStationImageImpl(stationId, dataUrl);
      
      toast({
        title: "Image Uploaded",
        description: "Station cover image has been updated successfully"
      });
      
      console.log(`Uploaded image for station ${stationId}`);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Upload Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    updateStreamDetails: updateStreamDetailsImpl,
    updateStreamUrl: updateStreamUrlImpl,
    updateStationImage: updateStationImageImpl,
    uploadStationImage: uploadStationImageImpl
  };
};
