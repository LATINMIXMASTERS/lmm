
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Music, ArrowRight } from 'lucide-react';

const FeaturedMixes: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-12 md:mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Featured Latin Mixes</h2>
        <button
          onClick={() => navigate('/mixes')}
          className="text-gold hover:underline flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Salsa Mix */}
        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img
            src="https://images.unsplash.com/photo-1516550822454-ca135c597484?q=80&w=2070&auto=format&fit=crop"
            alt="Salsa Mix Cover"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="inline-block px-2 py-1 bg-red-600 text-white text-xs rounded mb-2">Salsa</div>
            <h3 className="font-bold text-lg mb-2">Salsa Classics Remix</h3>
            <p className="text-gray-600 text-sm">A journey through timeless salsa hits reimagined.</p>
            <button
              onClick={() => navigate('/mixes')}
              className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
            >
              <Music className="inline-block w-4 h-4 mr-2" />
              Listen Now
            </button>
          </div>
        </div>
        
        {/* Bachata Mix */}
        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img
            src="https://images.unsplash.com/photo-1541419403037-548046a244c4?q=80&w=2070&auto=format&fit=crop"
            alt="Bachata Mix Cover"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="inline-block px-2 py-1 bg-purple-600 text-white text-xs rounded mb-2">Bachata</div>
            <h3 className="font-bold text-lg mb-2">Bachata Sensual</h3>
            <p className="text-gray-600 text-sm">Modern bachata tracks perfect for dancing the night away.</p>
            <button
              onClick={() => navigate('/mixes')}
              className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
            >
              <Music className="inline-block w-4 h-4 mr-2" />
              Listen Now
            </button>
          </div>
        </div>
        
        {/* Reggaeton Mix */}
        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
          <img
            src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=2070&auto=format&fit=crop"
            alt="Reggaeton Mix Cover"
            className="w-full h-48 object-cover"
          />
          <div className="p-4">
            <div className="inline-block px-2 py-1 bg-blue-600 text-white text-xs rounded mb-2">Reggaeton</div>
            <h3 className="font-bold text-lg mb-2">Reggaeton Hits 2024</h3>
            <p className="text-gray-600 text-sm">The hottest reggaeton tracks making waves this year.</p>
            <button
              onClick={() => navigate('/mixes')}
              className="mt-4 bg-gold hover:bg-gold-dark text-black font-bold py-2 px-4 rounded-full block w-full text-center transition-colors duration-300"
            >
              <Music className="inline-block w-4 h-4 mr-2" />
              Listen Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedMixes;
