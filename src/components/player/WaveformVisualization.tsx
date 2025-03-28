
import React, { useRef, useEffect } from 'react';

interface WaveformVisualizationProps {
  isPlaying: boolean;
}

const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
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
    
    // Generate points for the waveform
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
      
      // Draw visualization
      for (let i = 0; i < barCount; i++) {
        // More dynamic for middle frequencies
        const multiplier = Math.sin((i / barCount) * Math.PI) * 0.5 + 0.5;
        
        // Different patterns based on position
        let height = 0;
        if (i % 4 === 0) {
          height = (Math.random() * 0.6 + 0.2) * rectHeight * 0.6 * multiplier;
        } else if (i % 2 === 0) {
          height = (Math.random() * 0.3 + 0.1) * rectHeight * 0.6 * multiplier;
        } else {
          height = (Math.random() * 0.15 + 0.05) * rectHeight * 0.6 * multiplier;
        }
        
        const xPos = i * barWidth;
        const yPos = (rectHeight - height) / 2;
        
        // Gradient for active bars
        if (isPlaying && i < barCount * 0.8) {
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
    }
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
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
