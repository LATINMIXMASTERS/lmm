
import { createTrackCrudActions } from './trackCrudActions';
import { createTrackInteractionActions } from './trackInteractionActions';
import { createGenreActions } from './genreActions';
import { Track, Genre } from '@/models/Track';

/**
 * Creates and combines all track-related action functions from sub-modules
 * This maintains the same API as the original createTrackActions function
 * but organizes the code into more maintainable chunks
 */
export const createTrackActions = (
  state: { tracks: Track[], genres: Genre[] },
  dispatch: React.Dispatch<any>,
  userInfo: { id?: string, isAdmin?: boolean } | null,
  toast: any,
  setCurrentPlayingStation: (stationId: string | null) => void
) => {
  // Create track CRUD actions (add, update, delete)
  const trackCrudActions = createTrackCrudActions(state, dispatch, userInfo, toast);
  
  // Create genre actions
  const genreActions = createGenreActions(state, dispatch, userInfo, toast);
  
  // Create track interaction actions (like, comment, play, share)
  const trackInteractionActions = createTrackInteractionActions(
    state,
    dispatch,
    toast,
    setCurrentPlayingStation
  );
  
  // Return all actions in a single object to maintain the original API
  return {
    ...trackCrudActions,
    ...genreActions,
    ...trackInteractionActions
  };
};
