
import { RadioState } from '../types';
import { formatStreamUrl } from '@/utils/radioUtils';
import { RadioAction } from '../radioActionTypes';

// Reducers for station-related actions
export const stationReducers = {
  setStations: (state: RadioState, action: Extract<RadioAction, { type: 'SET_STATIONS' }>): RadioState => {
    return {
      ...state,
      stations: action.payload
    };
  },
  
  updateStreamDetails: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STREAM_DETAILS' }>): RadioState => {
    return {
      ...state,
      stations: state.stations.map(station => 
        station.id === action.payload.stationId 
          ? { 
              ...station, 
              streamDetails: { 
                ...action.payload.streamDetails,
                url: formatStreamUrl(action.payload.streamDetails.url)
              } 
            } 
          : station
      )
    };
  },
  
  updateStreamUrl: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STREAM_URL' }>): RadioState => {
    return {
      ...state,
      stations: state.stations.map(station => {
        if (station.id === action.payload.stationId) {
          return { 
            ...station, 
            streamUrl: formatStreamUrl(action.payload.streamUrl) 
          };
        }
        return station;
      })
    };
  },
  
  updateStationImage: (state: RadioState, action: Extract<RadioAction, { type: 'UPDATE_STATION_IMAGE' }>): RadioState => {
    return {
      ...state,
      stations: state.stations.map(station => {
        if (station.id === action.payload.stationId) {
          return { ...station, image: action.payload.imageUrl };
        }
        return station;
      })
    };
  }
};
