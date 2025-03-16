
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { RadioStation } from '@/models/RadioStation';
import StationCard from '@/components/StationCard';

interface LiveRadioSectionProps {
  stations: RadioStation[];
  currentPlayingStation: string | null;
  onStationClick: (stationId: string) => void;
}

const LiveRadioSection: React.FC<LiveRadioSectionProps> = ({ 
  stations, 
  currentPlayingStation, 
  onStationClick 
}) => {
  const navigate = useNavigate();
  
  return (
    <section className="mb-12 md:mb-16">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold">Live Latin Radio</h2>
        <button
          onClick={() => navigate('/stations')}
          className="text-gold hover:underline flex items-center"
        >
          View All <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stations.map(station => (
          <StationCard
            key={station.id}
            station={station}
            isPlaying={currentPlayingStation === station.id}
            onPlayToggle={onStationClick}
          />
        ))}
      </div>
    </section>
  );
};

export default LiveRadioSection;
