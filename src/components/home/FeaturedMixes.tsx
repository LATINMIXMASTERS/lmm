
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';
import { useTrack } from '@/hooks/useTrackContext';

const FeaturedMixes: React.FC = () => {
  const navigate = useNavigate();
  const { tracks, genres } = useTrack();
  
  // Get genres that actually have tracks/mixes
  const genresWithTracks = useMemo(() => {
    const genreTrackMap = new Map();
    
    // Count tracks for each genre
    tracks.forEach(track => {
      const genreName = track.genre;
      if (!genreTrackMap.has(genreName)) {
        genreTrackMap.set(genreName, []);
      }
      genreTrackMap.get(genreName).push(track);
    });
    
    // Get genres with at least one track
    return genres
      .filter(genre => genreTrackMap.has(genre.name) && genreTrackMap.get(genre.name).length > 0)
      .slice(0, 3) // Limit to 3 genres
      .map(genre => ({
        ...genre,
        sampleTrack: genreTrackMap.get(genre.name)[0] // Get first track as sample
      }));
  }, [tracks, genres]);
  
  if (genresWithTracks.length === 0) {
    return null;
  }
  
  const genreColorMap = {
    'Salsa': 'bg-red-600',
    'Bachata': 'bg-purple-600',
    'Reggaeton': 'bg-blue-600',
    'Merengue': 'bg-green-600',
    'Cumbia': 'bg-orange-600',
    'Dembow': 'bg-pink-600'
  };

  // Navigate to the mixes page with the selected genre
  const handleGenreClick = (genreId: string) => {
    navigate(`/mixes?genre=${genreId}`);
  };
  
  return (
    <section className="mb-12 md:mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">FEATURED MIXES</h2>
        <button
          onClick={() => navigate('/mixes')}
          className="text-gold hover:underline flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {genresWithTracks.map(({ name, id, sampleTrack }) => (
          <div 
            key={id} 
            className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleGenreClick(id)}
          >
            <img
              src={sampleTrack?.coverImage || "https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"}
              alt={`${name} Mix Cover`}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <div className={`inline-block px-2 py-1 ${genreColorMap[name] || 'bg-gray-600'} text-white text-xs rounded mb-2`}>
                {name}
              </div>
              <h3 className="font-bold text-lg mb-2">{name} Classics</h3>
              <p className="text-gray-600 text-sm">
                Discover the best {name} tracks in this exclusive mix.
              </p>
              <button
                className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
              >
                <Music className="inline-block w-4 h-4 mr-2" />
                Listen Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedMixes;
