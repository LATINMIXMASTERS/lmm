
import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useRadio } from '@/hooks/useRadioContext';
import { useTrack } from '@/hooks/useTrackContext';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import CommentSection from '@/components/CommentSection';
import PlaybackControls from '@/components/player/PlaybackControls';
import TrackInfo from '@/components/player/TrackInfo';
import WaveformVisualization from '@/components/player/WaveformVisualization';
import InteractionControls from '@/components/player/InteractionControls';

interface PlayerProps {
  className?: string;
}

const Player: React.FC<PlayerProps> = ({ className }) => {
  const { stations, currentPlayingStation, setCurrentPlayingStation, audioState, setAudioState } = useRadio();
  const { tracks, currentPlayingTrack, setCurrentPlayingTrack, likeTrack, addComment, shareTrack } = useTrack();
  
  const [stationInfo, setStationInfo] = useState({
    name: 'WaveRadio - House',
    currentTrack: 'Unknown Artist - Groove Session',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop'
  });
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [likes, setLikes] = useState(127);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isTrackPlaying, setIsTrackPlaying] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const prevVolume = useRef(audioState.volume);
  const metadataTimerRef = useRef<number | null>(null);
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume / 100;
      
      audioRef.current.addEventListener('error', (e) => {
        console.error("Audio playback error:", e);
        toast({
          title: "Playback Error",
          description: "There was an error playing this stream. Please try a different station.",
          variant: "destructive"
        });
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audioRef.current.addEventListener('playing', () => {
        console.log("Audio is now playing");
        setAudioState(prev => ({ ...prev, isPlaying: true }));
      });
      
      audioRef.current.addEventListener('pause', () => {
        console.log("Audio is now paused");
        setAudioState(prev => ({ ...prev, isPlaying: false }));
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      });
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      });
      
      audioRef.current.addEventListener('ended', () => {
        setAudioState(prev => ({ ...prev, isPlaying: false }));
        setCurrentTime(0);
        if (audioRef.current) {
          audioRef.current.currentTime = 0;
        }
      });
    }
    
    return () => {
      if (metadataTimerRef.current) {
        window.clearInterval(metadataTimerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.src = '';
        audioRef.current = null;
      }
    };
  }, []);
  
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioState.isMuted ? 0 : audioState.volume / 100;
    }
  }, [audioState.volume, audioState.isMuted]);
  
  useEffect(() => {
    if (!currentPlayingStation || !audioRef.current) return;
    
    setIsTrackPlaying(false);
    setCurrentPlayingTrack(null);
    setAudioState(prev => ({ 
      ...prev, 
      currentStation: currentPlayingStation,
      currentTrack: null
    }));
    
    const currentStation = stations.find(station => station.id === currentPlayingStation);
    if (!currentStation) {
      console.error("Station not found:", currentPlayingStation);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a stream URL configured.",
        variant: "destructive"
      });
      return;
    }
    
    let streamUrl = '';
    
    if (currentStation.streamUrl) {
      streamUrl = currentStation.streamUrl;
      console.log("Using station streamUrl:", streamUrl);
    } else if (currentStation.streamDetails?.url) {
      streamUrl = currentStation.streamDetails.url;
      console.log("Using station streamDetails.url:", streamUrl);
    } else {
      console.error("No stream URL found for station:", currentPlayingStation);
      toast({
        title: "Stream Error",
        description: "This station doesn't have a stream URL configured.",
        variant: "destructive"
      });
      return;
    }
    
    if (!streamUrl.startsWith('http://') && !streamUrl.startsWith('https://')) {
      streamUrl = `https://${streamUrl}`;
    }
    
    if (streamUrl.includes('lmmradiocast.com')) {
      streamUrl = 'https://ice1.somafm.com/groovesalad-128-mp3';
      console.log("Using fallback test stream URL for development:", streamUrl);
    }
    
    console.log("Final audio source URL:", streamUrl);
    
    if (audioRef.current.src !== streamUrl) {
      const wasPlaying = !audioRef.current.paused;
      audioRef.current.pause();
      
      audioRef.current.src = streamUrl;
      audioRef.current.load();
      
      setStationInfo({
        name: currentStation.name,
        currentTrack: 'Loading...',
        coverImage: currentStation.image || 'https://images.unsplash.com/photo-1614149162883-504ce4d13909?q=80&w=200&auto=format&fit=crop'
      });
      
      if (wasPlaying || audioState.isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Failed to play audio:", error);
            toast({
              title: "Playback Error",
              description: "Failed to play this station. Trying an alternative stream for demonstration.",
              variant: "destructive"
            });
            
            audioRef.current!.src = 'https://ice1.somafm.com/groovesalad-128-mp3';
            audioRef.current!.load();
            audioRef.current!.play().catch(innerError => {
              console.error("Failed to play fallback audio:", innerError);
            });
          });
        }
      }
      
      setupMetadataPolling(streamUrl);
    }
  }, [currentPlayingStation, stations]);
  
  useEffect(() => {
    if (!currentPlayingTrack || !audioRef.current) return;
    
    const track = tracks.find(t => t.id === currentPlayingTrack);
    if (!track) {
      console.error("Track not found:", currentPlayingTrack);
      return;
    }
    
    console.log("Changing audio source to track:", track.audioFile);
    setAudioState(prev => ({ 
      ...prev, 
      currentTrack: currentPlayingTrack,
      currentStation: null
    }));
    
    audioRef.current.pause();
    audioRef.current.src = track.audioFile;
    
    setStationInfo({
      name: track.artist,
      currentTrack: track.title,
      coverImage: track.coverImage
    });
    
    setCurrentTime(0);
    
    if (track.duration) {
      setDuration(track.duration);
    }
    
    audioRef.current.load();
    audioRef.current.play().catch(error => {
      console.error("Failed to play track:", error);
      toast({
        title: "Playback Error",
        description: "Failed to play this track. Please try again.",
        variant: "destructive"
      });
    });
    
    setIsTrackPlaying(true);
    
    if (metadataTimerRef.current) {
      window.clearInterval(metadataTimerRef.current);
    }
    
    if (track.comments) {
      setComments(track.comments.map((comment: any) => ({
        id: comment.id,
        username: comment.username,
        text: comment.text,
        date: comment.date
      })));
    } else {
      setComments([]);
    }
    
    setLikes(track.likes || 0);
  }, [currentPlayingTrack, tracks]);
  
  useEffect(() => {
    setIsPlaying(audioState.isPlaying);
  }, [audioState.isPlaying]);
  
  const setupMetadataPolling = (streamUrl: string) => {
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

  const [isPlaying, setIsPlaying] = useState(audioState.isPlaying);
  const [volume, setVolume] = useState(audioState.volume);
  const [isMuted, setIsMuted] = useState(audioState.isMuted);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error("Failed to play audio:", error);
        toast({
          title: "Playback Error",
          description: "There was an error playing this media. Please try again.",
          variant: "destructive"
        });
      });
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setVolume(prevVolume.current);
      setIsMuted(false);
      setAudioState(prev => ({ ...prev, volume: prevVolume.current, isMuted: false }));
    } else {
      prevVolume.current = volume;
      setVolume(0);
      setIsMuted(true);
      setAudioState(prev => ({ ...prev, volume: 0, isMuted: true }));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    setAudioState(prev => ({ 
      ...prev, 
      volume: newVolume, 
      isMuted: newVolume === 0 
    }));
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const position = parseInt(e.target.value, 10);
    audioRef.current.currentTime = position;
    setCurrentTime(position);
  };

  const handleLike = () => {
    if (currentPlayingTrack) {
      likeTrack(currentPlayingTrack);
      if (isLiked) {
        setLikes(likes - 1);
      } else {
        setLikes(likes + 1);
      }
      setIsLiked(!isLiked);
    }
  };

  const handleShare = () => {
    if (currentPlayingTrack) {
      shareTrack(currentPlayingTrack);
    } else {
      alert('Share functionality will be implemented soon!');
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !currentPlayingTrack) return;
    
    addComment(currentPlayingTrack, {
      userId: 'current-user',
      username: 'You',
      text: newComment
    });
    
    const newCommentObj = {
      id: Date.now().toString(),
      username: 'You',
      text: newComment,
      date: new Date().toISOString()
    };
    setComments([newCommentObj, ...comments]);
    setNewComment('');
  };

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
          <TrackInfo 
            stationInfo={stationInfo}
            isTrackPlaying={isTrackPlaying}
            currentTime={currentTime}
            duration={duration}
            handleProgressChange={handleProgressChange}
            setIsExpanded={setIsExpanded}
            isExpanded={isExpanded}
          />
          
          <div className="flex items-center space-x-6">
            <PlaybackControls 
              isPlaying={isPlaying}
              togglePlayPause={togglePlayPause}
              volume={volume}
              isMuted={isMuted}
              handleVolumeChange={handleVolumeChange}
              toggleMute={toggleMute}
              currentTime={currentTime}
              duration={duration}
              handleProgressChange={handleProgressChange}
              isTrackPlaying={isTrackPlaying}
            />
            
            <div className="hidden md:flex items-center space-x-4">
              <InteractionControls 
                handleLike={handleLike}
                handleShare={handleShare}
                setShowComments={setShowComments}
                isLiked={isLiked}
                showComments={showComments}
              />
            </div>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 py-4">
            <WaveformVisualization isPlaying={isPlaying} />
            
            <div className="md:hidden flex justify-between mt-4">
              <InteractionControls 
                handleLike={handleLike}
                handleShare={handleShare}
                setShowComments={setShowComments}
                isLiked={isLiked}
                showComments={showComments}
              />
              
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
            
            <CommentSection 
              comments={comments}
              newComment={newComment}
              onCommentChange={setNewComment}
              onSubmitComment={handleAddComment}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;

