
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
    try {
      dispatch({ 
        type: 'UPDATE_STREAM_DETAILS', 
        payload: { stationId, streamDetails } 
      });
      
      toast({
        title: "Stream details updated",
        description: "The streaming configuration has been saved."
      });
    } catch (error) {
      console.error("Error updating stream details:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating the stream details.",
        variant: "destructive"
      });
    }
  };
  
  const updateStreamUrlImpl = (stationId: string, streamUrl: string) => {
    try {
      dispatch({ 
        type: 'UPDATE_STREAM_URL', 
        payload: { stationId, streamUrl } 
      });
      
      toast({
        title: "Stream URL updated",
        description: "The streaming URL has been updated."
      });
    } catch (error) {
      console.error("Error updating stream URL:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating the stream URL.",
        variant: "destructive"
      });
    }
  };
  
  const updateStationImageImpl = (stationId: string, imageUrl: string) => {
    try {
      console.log("Dispatching UPDATE_STATION_IMAGE with:", { stationId, imageUrl });
      dispatch({ 
        type: 'UPDATE_STATION_IMAGE', 
        payload: { stationId, imageUrl } 
      });
      
      toast({
        title: "Station image updated",
        description: "The station image has been updated."
      });
    } catch (error) {
      console.error("Error updating station image:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating the station image.",
        variant: "destructive"
      });
    }
  };
  
  const uploadStationImageImpl = async (stationId: string, file: File): Promise<void> => {
    try {
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
      
      console.log("Uploading image for station", stationId, "with data URL of length", dataUrl.length);
      
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
      throw error; // Re-throw to allow handling in the component
    }
  };
  
  const updateStationS3ImageImpl = (stationId: string, s3ImageUrl: string) => {
    try {
      dispatch({ 
        type: 'UPDATE_STATION_S3_IMAGE', 
        payload: { stationId, s3ImageUrl } 
      });
      
      toast({
        title: "Station S3 image updated",
        description: "The station S3 image reference has been updated."
      });
    } catch (error) {
      console.error("Error updating S3 image:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating the S3 image reference.",
        variant: "destructive"
      });
    }
  };
  
  const updateStationMetadataImpl = (stationId: string, metadata: any) => {
    try {
      dispatch({ 
        type: 'UPDATE_STATION_METADATA', 
        payload: { stationId, metadata } 
      });
      
      console.log(`Updated metadata for station ${stationId}:`, metadata);
    } catch (error) {
      console.error("Error updating metadata:", error);
    }
  };

  const updateStationListenersImpl = (stationId: string, listeners: number) => {
    try {
      dispatch({ 
        type: 'UPDATE_STATION_LISTENERS', 
        payload: { stationId, listeners } 
      });
      
      console.log(`Updated listeners for station ${stationId} to ${listeners}`);
    } catch (error) {
      console.error("Error updating listeners:", error);
    }
  };

  const updateVideoStreamUrlImpl = (stationId: string, videoStreamUrl: string) => {
    try {
      dispatch({ 
        type: 'UPDATE_VIDEO_STREAM_URL', 
        payload: { stationId, videoStreamUrl } 
      });
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, videoStreamUrl };
        }
        return station;
      });
      
      // Force localStorage update with timestamp for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      localStorage.setItem('video_stream_url_sync', Date.now().toString());
      
      // Enhanced multi-device sync for video stream URL changes
      try {
        // 1. Use storage events to sync across tabs
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'latinmixmasters_stations',
          newValue: JSON.stringify(updatedStations)
        }));
        
        // 2. Set unique keys for video stream changes
        const syncData = JSON.stringify({
          stationId,
          videoStreamUrl,
          timestamp: Date.now(),
          action: 'video_stream_update'
        });
        localStorage.setItem(`station_${stationId}_video`, syncData);
        
        // 3. Broadcast high-priority event
        const broadcastData = JSON.stringify({
          deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown',
          timestamp: Date.now(),
          stationId,
          videoStreamUrl,
          action: 'broadcast_video_update',
          priority: 'high'
        });
        localStorage.setItem('latinmixmasters_sync_broadcast', broadcastData);
        
        // 4. Set host action flag
        localStorage.setItem('latinmixmasters_host_action', 'true');
        setTimeout(() => localStorage.removeItem('latinmixmasters_host_action'), 2000);
        
        // 5. Try to dispatch a custom event for immediate sync
        try {
          const event = new CustomEvent('latinmixmasters_broadcast', {
            detail: {
              stationId,
              action: 'video_stream_update',
              timestamp: Date.now()
            }
          });
          window.dispatchEvent(event);
        } catch (error) {
          console.error("Error dispatching custom event:", error);
        }
      } catch (error) {
        console.error("Error broadcasting video stream update:", error);
      }
      
      toast({
        title: "Video stream URL updated",
        description: "The video streaming URL has been updated and broadcasted to all devices."
      });
    } catch (error) {
      console.error("Error updating video stream URL:", error);
      toast({
        title: "Update Error",
        description: "There was a problem updating the video stream URL.",
        variant: "destructive"
      });
    }
  };

  return {
    updateStreamDetails: updateStreamDetailsImpl,
    updateStreamUrl: updateStreamUrlImpl,
    updateStationImage: updateStationImageImpl,
    uploadStationImage: uploadStationImageImpl,
    updateStationS3Image: updateStationS3ImageImpl,
    updateStationMetadata: updateStationMetadataImpl,
    updateStationListeners: updateStationListenersImpl,
    updateVideoStreamUrl: updateVideoStreamUrlImpl
  };
};
