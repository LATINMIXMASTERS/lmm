
import { RadioState } from '../types';
import { RadioStation, FileUpload } from '@/models/RadioStation';
import { useToast } from '@/hooks/use-toast';

export const useStationActions = (
  state: RadioState, 
  dispatch: React.Dispatch<any>
) => {
  const { toast } = useToast();

  // Helper function to enforce cross-device synchronization
  const synchronizeAcrossDevices = (key: string, data: any) => {
    // Store with timestamp for reliable sync detection
    const syncData = JSON.stringify({
      data,
      timestamp: Date.now(),
      deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown'
    });
    
    // Set multiple sync points for better detection
    localStorage.setItem(key, syncData);
    localStorage.setItem('latinmixmasters_last_sync', Date.now().toString());
    
    // Force storage event for immediate cross-tab sync
    try {
      window.dispatchEvent(new StorageEvent('storage', {
        key: key,
        newValue: syncData
      }));
      
      // Additional broadcast event for better device detection
      const broadcastEvent = new CustomEvent('latinmixmasters_broadcast', {
        detail: {
          key,
          timestamp: Date.now(),
          data
        }
      });
      window.dispatchEvent(broadcastEvent);
    } catch (error) {
      console.error("Error broadcasting sync event:", error);
    }
  };

  const updateStreamDetailsImpl = (
    stationId: string, 
    streamDetails: { url: string; port: string; password: string }
  ) => {
    try {
      dispatch({ 
        type: 'UPDATE_STREAM_DETAILS', 
        payload: { stationId, streamDetails } 
      });
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, streamDetails };
        }
        return station;
      });
      
      // Force localStorage update for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      synchronizeAcrossDevices(`station_${stationId}_stream_details`, streamDetails);
      
      toast({
        title: "Stream details updated",
        description: "The streaming configuration has been saved and broadcasted to all devices."
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, streamUrl };
        }
        return station;
      });
      
      // Force localStorage update for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      synchronizeAcrossDevices(`station_${stationId}_stream_url`, streamUrl);
      
      toast({
        title: "Stream URL updated",
        description: "The streaming URL has been updated and broadcasted to all devices."
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, image: imageUrl };
        }
        return station;
      });
      
      // Force localStorage update for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      synchronizeAcrossDevices(`station_${stationId}_image`, imageUrl);
      
      toast({
        title: "Station image updated",
        description: "The station image has been updated and broadcasted to all devices."
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, image: dataUrl };
        }
        return station;
      });
      
      // Force localStorage update for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      synchronizeAcrossDevices(`station_${stationId}_image_upload`, { id: stationId, timestamp: Date.now() });
      
      toast({
        title: "Image uploaded",
        description: "The station image has been uploaded successfully to all devices."
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, s3ImageUrl };
        }
        return station;
      });
      
      // Force localStorage update for better cross-device sync
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      synchronizeAcrossDevices(`station_${stationId}_s3_image`, s3ImageUrl);
      
      toast({
        title: "Station S3 image updated",
        description: "The station S3 image reference has been updated and broadcasted to all devices."
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, metadata };
        }
        return station;
      });
      
      // Update localStorage
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      
      // Only broadcast critical metadata changes
      if (metadata && (metadata.title || metadata.artist)) {
        synchronizeAcrossDevices(`station_${stationId}_metadata`, metadata);
      }
      
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
      
      // Get updated stations after dispatch
      const updatedStations = state.stations.map(station => {
        if (station.id === stationId) {
          return { ...station, listeners };
        }
        return station;
      });
      
      // Update localStorage, but don't need full broadcast for listener counts
      localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
      localStorage.setItem(`station_${stationId}_listeners`, JSON.stringify({
        count: listeners,
        timestamp: Date.now()
      }));
      
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
      
      // Enhanced multi-device sync specifically for video stream URL
      synchronizeAcrossDevices(`station_${stationId}_video_stream`, {
        videoStreamUrl,
        stationId,
        timestamp: Date.now()
      });
      
      // Special broadcast for video players
      const videoEvent = {
        type: 'video_stream_update',
        stationId,
        videoStreamUrl,
        timestamp: Date.now(),
        deviceId: localStorage.getItem('latinmixmasters_device_id') || 'unknown'
      };
      
      localStorage.setItem('latinmixmasters_video_event', JSON.stringify(videoEvent));
      
      // Create and dispatch a custom event for immediate notification
      try {
        const event = new CustomEvent('video_stream_update', {
          detail: videoEvent
        });
        window.dispatchEvent(event);
      } catch (error) {
        console.error("Error dispatching video event:", error);
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
