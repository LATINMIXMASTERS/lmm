import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Radio, Heart, Share2, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useRadio } from '@/contexts/RadioContext';
import { useToast } from '@/hooks/use-toast';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [stationInfo, setStationInfo] = useState({
    name: 'WaveRadio - House',
    currentTrack: 'Unknown Artist - Groove Session',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [prevVolume, setPrevVolume] = useState(80);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(127);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([
    { id: '1', user: 'DJ Carlos', text: 'Great mix!', time: '2 hours ago' },
    { id: '2', user: 'Maria123', text: 'Love the beats on this one', time: '1 day ago' },
    { id: '3', user: 'musiclover', text: 'Can\'t stop listening to this!', time: '3 days ago' }
  ]);
  const [newComment, setNewComment] = useState('');
  const [metadata, setMetadata] = useState<string>('');
  const metadataTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const { stations, currentPlayingStation } = useRadio();
  
  useEffect(() => {
    let defaultStream = 'https://streams.90s90s.de/danceradio/mp3-192/streams.90s90s.de/';
    
    const currentStation = stations.find(station => station.id === currentPlayingStation);
    if (currentStation?.streamDetails?.url) {
      defaultStream = currentStation.streamDetails.url;
      
      if (!defaultStream.startsWith('http://') && !defaultStream.startsWith('https://')) {
        defaultStream = `https://${defaultStream}`;
      }
      
      console.log("Setting up audio with stream:", defaultStream);
    }
    
    audioRef.current = new Audio(defaultStream);
    audioRef.current.volume = volume / 100;
    
    audioRef.current.addEventListener('error', (e) => {
      console.error("Audio playback error:", e);
      toast({
        title: "Playback Error",
        description: "There was an error playing this station. Please try again later.",
        variant: "destructive"
      });
      setIsPlaying(false);
    });
    
    audioRef.current.addEventListener('playing', () => {
      console.log("Audio is now playing");
      setIsPlaying(true);
    });
    
    audioRef.current.addEventListener('pause', () => {
      console.log("Audio is now paused");
      setIsPlaying(false);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.remove();
        audioRef.current = null;
      }
      
      if (metadataTimerRef.current) {
        window.clearInterval(metadataTimerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!currentPlayingStation || !audioRef.current) return;
    
    const currentStation = stations.find(station => station.id === currentPlayingStation);
    if (!currentStation?.streamDetails?.url) return;
    
    let streamUrl = currentStation.streamDetails.url;
    
    if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
      streamUrl = `https://${streamUrl}`;
    }
    
    console.log("Changing audio source to:", streamUrl);
    
    const wasPlaying = !audioRef.current.paused;
    audioRef.current.pause();
    
    audioRef.current.src = streamUrl;
    
    setStationInfo({
      name: currentStation.name,
      currentTrack: 'Loading...',
      coverImage: currentStation.image
    });
    
    if (wasPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
        toast({
          title: "Playback Error",
          description: "Failed to play this station. Please try again.",
          variant: "destructive"
        });
      });
    }
    
    setupMetadataPolling(streamUrl);
  }, [currentPlayingStation, stations]);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume / 100;
    }
  }, [volume, isMuted]);
  
  const setupMetadataPolling = (streamUrl: string) => {
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
    }
    
    const fetchMetadata = async () => {
      try {
        const response = await fetch(`/api/metadata?url=${encodeURIComponent(streamUrl)}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setMetadata(data.title);
            setStationInfo(prev => ({
              ...prev,
              currentTrack: data.title
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch metadata:", error);
      }
    };
    
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
      setMetadata(randomTrack);
      setStationInfo(prev => ({
        ...prev,
        currentTrack: randomTrack
      }));
    };
    
    simulateMetadata();
    
    metadataTimerRef.current = window.setInterval(simulateMetadata, 15000);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
        toast({
          title: "Playback Error",
          description: "There was an error playing this station. Please try again.",
          variant: "destructive"
        });
      });
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleShare = () => {
    alert('Share functionality will be implemented soon!');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        user: 'You',
        text: newComment,
        time: 'Just now'
      };
      setComments([newCommentObj, ...comments]);
      setNewComment('');
    }
  };

  const waveformBars = Array.from({ length: 40 }, (_, i) => {
    const height = Math.random() * 100;
    return (
      <div 
        key={i}
        className={cn(
          "w-1 bg-blue mx-0.5 rounded-sm",
          isPlaying && i <= 30 ? "animate-pulse" : ""
        )}
        style={{ 
          height: `${height}%`, 
          opacity: isPlaying && i > 30 ? 0.3 : 0.7
        }}
      ></div>
    );
  });

  return (
    <div 
      className={cn(
        "fixed bottom-0 left-0 right-0 glass border-t border-gray-lightest shadow-md z-40",
        "transition-all duration-400 ease-in-out",
        showComments ? "h-96" : (isExpanded ? "h-48" : "h-20"),
        className
      )}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-full">
        <div className="flex items-center h-20">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-md bg-gray-lightest overflow-hidden flex-shrink-0 relative"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <img 
                src={stationInfo.coverImage} 
                alt={stationInfo.name}
                className="w-full h-full object-cover transition-all duration-400"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity duration-300">
                <Radio className="w-5 h-5 text-white" />
              </div>
            </div>
            
            <div className="min-w-0 flex-1">
              <h4 className="font-medium text-black truncate">{stationInfo.name}</h4>
              <p className="text-xs text-gray truncate">{stationInfo.currentTrack}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="text-gray hover:text-black transition-colors duration-300"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 accent-blue"
                aria-label="Volume control"
              />
            </div>
            
            <button
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-blue text-white flex items-center justify-center hover:bg-blue-dark transition-colors duration-300 shadow-sm"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>
            
            <div className="hidden md:flex items-center space-x-4">
              <button 
                onClick={handleLike}
                className={cn(
                  "transition-colors duration-300",
                  isLiked ? "text-red-500" : "text-gray hover:text-red-500"
                )}
                aria-label="Like track"
              >
                <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
              </button>
              
              <button
                onClick={() => setShowComments(!showComments)}
                className={cn(
                  "transition-colors duration-300",
                  showComments ? "text-blue" : "text-gray hover:text-blue"
                )}
                aria-label="Show comments"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleShare}
                className="text-gray hover:text-blue transition-colors duration-300"
                aria-label="Share track"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 py-4">
            <div className="flex h-16 items-end justify-center gap-0">
              {waveformBars}
            </div>
            
            <div className="md:hidden flex justify-between mt-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleLike}
                  className={cn(
                    "transition-colors duration-300",
                    isLiked ? "text-red-500" : "text-gray hover:text-red-500"
                  )}
                  aria-label="Like track"
                >
                  <Heart className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} />
                </button>
                
                <button
                  onClick={() => setShowComments(!showComments)}
                  className={cn(
                    "transition-colors duration-300",
                    showComments ? "text-blue" : "text-gray hover:text-blue"
                  )}
                  aria-label="Show comments"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleShare}
                  className="text-gray hover:text-blue transition-colors duration-300"
                  aria-label="Share track"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="text-gray hover:text-black transition-colors duration-300"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 accent-blue"
                  aria-label="Volume control"
                />
              </div>
            </div>
          </div>
        )}
        
        {showComments && (
          <div className="px-4 overflow-y-auto h-48 border-t border-gray-100 pt-4">
            <h3 className="font-medium mb-3">Comments ({comments.length})</h3>
            
            <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm" 
                placeholder="Add a comment..." 
              />
              <Button type="submit" size="sm">Post</Button>
            </form>
            
            <div className="space-y-3">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    {comment.user.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{comment.user}</span>
                      <span className="text-xs text-gray-500">{comment.time}</span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;
