
import React, { useRef, useEffect } from 'react';

interface WaveformVisualizationProps {
  isPlaying: boolean;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Try to connect to audio element if we're playing
    if (isPlaying) {
      try {
        // Find the audio element in the DOM
        const audioElement = document.querySelector('audio');
        
        if (audioElement && !audioContextRef.current) {
          // Create audio context and analyzer
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          
          // Connect audio element to analyzer
          const source = audioContextRef.current.createMediaElementSource(audioElement);
          source.connect(analyserRef.current);
          analyserRef.current.connect(audioContextRef.current.destination);
          
          // Configure analyzer
          analyserRef.current.fftSize = 256;
          const bufferLength = analyserRef.current.frequencyBinCount;
          dataArrayRef.current = new Uint8Array(bufferLength);
          
          console.log('Successfully connected to audio element for visualization');
        }
      } catch (error) {
        console.log('Could not connect to audio for visualization:', error);
        // Will fallback to simulated visualization
      }
    }
    
    // Set canvas dimensions with higher resolution
    const setCanvasDimensions = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      
      ctx.scale(dpr, dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    };
    
    // Call once on mount
    setCanvasDimensions();
    
    // Also handle resize
    window.addEventListener('resize', setCanvasDimensions);
    
    // Generate points for the waveform - using audio data if available
    const generatePoints = () => {
      const width = canvas.width;
      const height = canvas.height;
      const dpr = window.devicePixelRatio || 1;
      
      // Adjust for DPR
      const rectWidth = width / dpr;
      const rectHeight = height / dpr;
      
      const barCount = 100;
      const barWidth = rectWidth / barCount;
      const barMargin = barWidth * 0.2;
      const adjustedBarWidth = barWidth - barMargin;
      
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, rectWidth, rectHeight);
      
      // Get theme colors
      const isLightTheme = document.documentElement.classList.contains('light');
      const primaryColor = isLightTheme ? '#3377FF' : '#5590FF';
      const secondaryColor = isLightTheme ? '#E5E7EB' : '#374151';
      
      // Check if we can use real audio data
      let usingRealAudioData = false;
      if (isPlaying && analyserRef.current && dataArrayRef.current) {
        try {
          // Get frequency data
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          usingRealAudioData = true;
        } catch (error) {
          console.log('Error getting frequency data:', error);
        }
      }
      
      // Draw visualization
      for (let i = 0; i < barCount; i++) {
        let height = 0;
        
        if (usingRealAudioData && dataArrayRef.current) {
          // Map bar index to frequency data index
          const dataIndex = Math.floor(i * dataArrayRef.current.length / barCount);
          // Get normalized value (0-1) from frequency data (0-255)
          const normalizedValue = dataArrayRef.current[dataIndex] / 255;
          // Apply multiplier based on frequency
          height = normalizedValue * rectHeight * 0.8;
        } else {
          // Simulated visualization
          // More dynamic for middle frequencies
          const multiplier = Math.sin((i / barCount) * Math.PI) * 0.5 + 0.5;
          
          // Different patterns based on position
          if (i % 4 === 0) {
            height = (Math.random() * 0.6 + 0.2) * rectHeight * 0.6 * multiplier;
          } else if (i % 2 === 0) {
            height = (Math.random() * 0.3 + 0.1) * rectHeight * 0.6 * multiplier;
          } else {
            height = (Math.random() * 0.15 + 0.05) * rectHeight * 0.6 * multiplier;
          }
          
          // Add subtle oscillation if playing
          if (isPlaying) {
            height *= 0.8 + 0.2 * Math.sin(Date.now() / 200 + i / 5);
          }
        }
        
        const xPos = i * barWidth;
        const yPos = (rectHeight - height) / 2;
        
        // Gradient for active bars
        if (isPlaying) {
          const gradient = ctx.createLinearGradient(0, yPos, 0, yPos + height);
          gradient.addColorStop(0, primaryColor);
          gradient.addColorStop(1, primaryColor + '88');
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = secondaryColor;
        }
        
        // Round the bars
        const radius = adjustedBarWidth / 2;
        ctx.beginPath();
        ctx.moveTo(xPos + radius, yPos);
        ctx.lineTo(xPos + adjustedBarWidth - radius, yPos);
        ctx.quadraticCurveTo(xPos + adjustedBarWidth, yPos, xPos + adjustedBarWidth, yPos + radius);
        ctx.lineTo(xPos + adjustedBarWidth, yPos + height - radius);
        ctx.quadraticCurveTo(xPos + adjustedBarWidth, yPos + height, xPos + adjustedBarWidth - radius, yPos + height);
        ctx.lineTo(xPos + radius, yPos + height);
        ctx.quadraticCurveTo(xPos, yPos + height, xPos, yPos + height - radius);
        ctx.lineTo(xPos, yPos + radius);
        ctx.quadraticCurveTo(xPos, yPos, xPos + radius, yPos);
        ctx.closePath();
        ctx.fill();
      }
    };
    
    // Animate the waveform
    const animate = () => {
      generatePoints();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (isPlaying) {
      animate();
    } else {
      generatePoints(); // Draw static waveform when not playing
      
      // Clean up audio context if we're stopping
      if (audioContextRef.current) {
        try {
          audioContextRef.current.suspend();
        } catch (error) {
          console.log('Error suspending audio context:', error);
        }
      }
    }
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      // Clean up audio context
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
          audioContextRef.current = null;
          analyserRef.current = null;
          dataArrayRef.current = null;
        } catch (error) {
          console.log('Error closing audio context:', error);
        }
      }
    };
  }, [isPlaying]);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-12 md:h-16"
      aria-label="Audio waveform visualization"
    />
  );
};

export default WaveformVisualization;
