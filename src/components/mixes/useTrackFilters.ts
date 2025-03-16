
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Track, Genre } from '@/models/Track';

export const useTrackFilters = (
  tracks: Track[],
  genres: Genre[],
  setCurrentPlayingTrack: (id: string | null) => void
) => {
  const location = useLocation();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [filteredTracks, setFilteredTracks] = useState(tracks);
  const [selectedTabGenre, setSelectedTabGenre] = useState('all');
  
  // Parse URL parameters
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
          setCurrentPlayingTrack(trackId);
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
  
  // Filter tracks based on selected genre tab
  useEffect(() => {
    if (selectedTabGenre === 'all') {
      setFilteredTracks(tracks);
    } else {
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
