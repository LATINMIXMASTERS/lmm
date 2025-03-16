
import { RadioStation } from '@/models/RadioStation';
import { getStationById as getStationByIdUtil } from '@/utils/radioUtils';

export const useStationQueries = (
  state: { stations: RadioStation[] }
) => {
  const getStationByIdImpl = (id: string) => getStationByIdUtil(state.stations, id);

  return {
    getStationById: getStationByIdImpl
  };
};
