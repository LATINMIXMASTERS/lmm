
import { Track, Genre } from '@/models/Track';

/**
 * Creates genre-related action functions
 * Currently just handles adding new genres
 */
export const createGenreActions = (
  state: { tracks: Track[], genres: Genre[] },
  dispatch: React.Dispatch<any>,
  userInfo: { id?: string, isAdmin?: boolean } | null,
  toast: any
) => {
  // Add a new genre
  const addGenre = (genreName: string) => {
    if (!userInfo) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to add a genre",
        variant: "destructive"
      });
      throw new Error("Authentication required");
    }

    if (state.genres.some(g => g.name.toLowerCase() === genreName.toLowerCase())) {
      toast({
        title: "Genre exists",
        description: "This genre already exists",
        variant: "destructive"
      });
      throw new Error("Genre exists");
    }

    const newGenre: Genre = {
      id: Math.random().toString(36).substring(2, 11),
      name: genreName,
      count: 0,
      createdBy: userInfo.id || 'unknown',
      createdAt: new Date().toISOString()
    };
    
    dispatch({ type: 'ADD_GENRE', payload: newGenre });
    localStorage.setItem('lmm_genres', JSON.stringify([...state.genres, newGenre]));
    
    toast({
      title: "Genre added",
      description: `The genre "${genreName}" has been added`,
    });
    
    return newGenre;
  };

  return {
    addGenre
  };
};
