
import { useState, useEffect } from 'react';
import { Track, Genre } from '@/models/Track';
import { useIsMobile } from '@/hooks/use-mobile';

/**
 * Custom hook for filtering tracks by genre and other criteria
 * Provides responsive filtering options for both mobile and desktop
 */
export const useTrackFilters = (
  tracks: Track[], 
  genres: Genre[],
  setCurrentPlayingTrack: (trackId: string | null) => void
) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedTabGenre, setSelectedTabGenre] = useState<string>('all');
  const [filteredTracks, setFilteredTracks] = useState<Track[]>(tracks);
  const isMobile = useIsMobile();
  
  // Filter tracks whenever the selected genre or tracks change
  useEffect(() => {
    if (selectedTabGenre === 'all') {
      setFilteredTracks(tracks);
    } else {
      const genre = genres.find(g => g.id === selectedTabGenre);
      if (genre) {
        setFilteredTracks(tracks.filter(track => track.genre === genre.name));
      }
    }
    
    // When changing filters, stop any playing track
    setCurrentPlayingTrack(null);
  }, [selectedTabGenre, tracks, genres, setCurrentPlayingTrack]);
  
  // On mobile, we might want to adjust the UI or filtering behavior
  useEffect(() => {
    if (isMobile) {
      // Mobile-specific adjustments
      // For example, we might want to collapse filters or show fewer items
    }
  }, [isMobile]);

  return {
    selectedGenre,
    setSelectedGenre,
    filteredTracks,
    selectedTabGenre,
    setSelectedTabGenre,
    isMobile
  };
};
