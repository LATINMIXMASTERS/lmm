
import { MutableRefObject } from 'react';

interface StationInfo {
  name: string;
  currentTrack: string;
  coverImage: string;
}

export const setupMetadataPolling = (
  streamUrl: string,
  metadataTimerRef: MutableRefObject<number | null>,
  setStationInfo: React.Dispatch<React.SetStateAction<StationInfo>>
): void => {
  if (metadataTimerRef.current) {
    window.clearInterval(metadataTimerRef.current);
  }
  
  const simulateMetadata = () => {
    const tracks = [
      "DJ Lobo - Bachata Mix 2025",
      "Marc Anthony - Vivir Mi Vida",
      "Bad Bunny - Tití Me Preguntó",
      "Romeo Santos - Propuesta Indecente",
      "Daddy Yankee - Gasolina (Club Mix)",
      "Luis Fonsi - Despacito (Radio Edit)",
      "Aventura - Obsesión",
      "Rauw Alejandro - Todo de Ti"
    ];
    
    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)];
    setStationInfo(prev => ({
      ...prev,
      currentTrack: randomTrack
    }));
  };
  
  simulateMetadata();
  
  metadataTimerRef.current = window.setInterval(simulateMetadata, 15000);
};
