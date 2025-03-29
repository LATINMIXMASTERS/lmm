
import { useStationDetails as useStationDetailsImpl } from './station-details/useStationDetails';

// This is just a compatibility wrapper to avoid breaking existing imports
export const useStationDetails = useStationDetailsImpl;
export default useStationDetails;
