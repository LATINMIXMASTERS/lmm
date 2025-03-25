
import { RadioState } from '../types';
import { RadioAction } from '../radioActionTypes';

// Reducers for station-related actions
export const stationReducers = {
  setStations: (state: RadioState, action: Extract<RadioAction, { type: 'SET_STATIONS' }>): RadioState => {
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(action.payload));
    
    return {
      ...state,
      stations: action.payload
    };
  },
  
  updateStreamDetails: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STREAM_DETAILS' }>): RadioState => {
    const { stationId, streamDetails } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, streamDetails } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateStreamUrl: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STREAM_URL' }>): RadioState => {
    const { stationId, streamUrl } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, streamUrl } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateStationImage: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STATION_IMAGE' }>): RadioState => {
    const { stationId, imageUrl } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, image: imageUrl } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateStationS3Image: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STATION_S3_IMAGE' }>): RadioState => {
    const { stationId, s3ImageUrl } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, s3Image: s3ImageUrl } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateStationMetadata: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STATION_METADATA' }>): RadioState => {
    const { stationId, metadata } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, currentMetadata: metadata } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateStationListeners: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STATION_LISTENERS' }>): RadioState => {
    const { stationId, listeners } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, listeners } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  },
  
  updateVideoStreamUrl: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_VIDEO_STREAM_URL' }>): RadioState => {
    const { stationId, videoStreamUrl } = action.payload;
    
    const updatedStations = state.stations.map(station => 
      station.id === stationId 
        ? { ...station, videoStreamUrl } 
        : station
    );
    
    // Save to localStorage for persistence
    localStorage.setItem('latinmixmasters_stations', JSON.stringify(updatedStations));
    
    return {
      ...state,
      stations: updatedStations
    };
  }
};
