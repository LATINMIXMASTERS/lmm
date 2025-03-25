
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export const useTrackFormState = () => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [selectedArtistId, setSelectedArtistId] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  // Set current user as default artist when component mounts
  useEffect(() => {
    if (user) {
      setSelectedArtistId(user.id);
    }
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setSelectedGenre('');
    // Don't reset the artist ID as it should stay as the current user
  };

  return {
    title,
    setTitle,
    selectedArtistId,
    setSelectedArtistId,
    selectedGenre,
    setSelectedGenre,
    resetForm
  };
};
