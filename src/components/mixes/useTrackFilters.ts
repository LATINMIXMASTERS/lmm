
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Track, Genre } from '@/models/Track';

/**
 * Custom hook for filtering tracks by genre and handling URL parameters
 * Manages selected genres, filtered tracks, and URL-based navigation
 * 
 * @param tracks - All available tracks
 * @param genres - All available genres
 * @param setCurrentPlayingTrack - Function to set the currently playing track
 */
export const useTrackFilters = (
  tracks: Track[],
  genres: Genre[],
  setCurrentPlayingTrack: (id: string | null) => void
) => {
  const location = useLocation();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  
  /**
   * Process URL parameters to determine which genre tab to show
   * or which track to play when navigating directly to a track
   */
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const genre = searchParams.get('genre');
    
    if (genre) {
      // Set selected tab to the genre from the URL parameter
      setSelectedTabGenre(genre);
    } else {
      // Check if there's a track in URL
      const trackId = searchParams.get('track');
      if (trackId) {
        const track = tracks.find(t => t.id === trackId);
        if (track) {
          // Automatically play the track specified in the URL
          setCurrentPlayingTrack(trackId);
          
          // Switch to the appropriate genre tab for this track
          if (track.genre) {
            const genreObj = genres.find(g => g.name === track.genre);
            if (genreObj) {
              setSelectedTabGenre(genreObj.id);
            }
          }
        }
      }
    }
  }, [location.search, tracks, genres, setCurrentPlayingTrack]);
  
  /**
   * Filter tracks whenever the selected genre tab changes
   */
  useEffect(() => {
    if (selectedTabGenre === 'all') {
      // Show all tracks when "All Genres" tab is selected
      setFilteredTracks(tracks);
    } else {
      // Filter tracks by the selected genre
      const genre = genres.find(g => g.id === selectedTabGenre);
      if (genre) {
        setFilteredTracks(tracks.filter(track => track.genre === genre.name));
      }
    }
  }, [selectedTabGenre, tracks, genres]);

  return {
    selectedGenre,
    filteredTracks,
    selectedTabGenre,
    setSelectedTabGenre
  };
};
