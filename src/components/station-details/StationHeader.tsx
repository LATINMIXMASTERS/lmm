
import React from 'react';

interface StationHeaderProps {
  stationName: string;
  genre: string;
  imageUrl: string;
}

const StationHeader: React.FC<StationHeaderProps> = ({ 
  stationName, 
  genre, 
  imageUrl 
}) => {
  return (
    <div className="h-48 md:h-64 relative">
      <img 
        src={imageUrl} 
        alt={stationName} 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
      <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 text-white">
        <h1 className="text-2xl md:text-3xl font-bold">{stationName}</h1>
        <p className="text-sm md:text-base opacity-90">{genre}</p>
      </div>
    </div>
  );
};

export default StationHeader;
