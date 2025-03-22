
import React, { useEffect, useState } from 'react';
import { Play, Radio, Music } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeroProps {
  className?: string;
}

const Hero: React.FC<HeroProps> = ({ className }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-red to-red-dark dark:from-black dark:to-gray-dark text-white",
        "min-h-[85vh] flex items-center justify-center rounded-xl",
        className
      )}
    >
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1NiIgaGVpZ2h0PSIxMDAiPgo8cmVjdCB3aWR0aD0iNTYiIGhlaWdodD0iMTAwIiBmaWxsPSIjZmZmZmZmIj48L3JlY3Q+CjxwYXRoIGQ9Ik0yOCA2NkwwIDUwTDAgMTZMMjggMEw1NiAxNkw1NiA1MEwyOCA2NkwyOCAxMDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+CjxwYXRoIGQ9Ik0yOCAwTDI4IDM0TDAgNTBMMCA4NEwyOCAxMDBMNTYgODRMNTYgNTBMMjggMzQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZmZmZiIgc3Ryb2tlLXdpZHRoPSIyIj48L3BhdGg+Cjwvc3ZnPg==')]"></div>
      </div>
      
      {/* Content container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 text-center">
        {/* Logo */}
        <div 
          className={cn(
            "mx-auto w-64 md:w-80 lg:w-96 mb-8",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.1s" }}
        >
          <img 
            src="/lovable-uploads/1c428522-a0bb-44a9-8f08-2afd85e478ed.png" 
            alt="LATINMIXMASTERS Logo"
            className="w-full"
          />
        </div>
        
        {/* Main title */}
        <h1 
          className={cn(
            "text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.3s" }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-gold-light to-gold-dark">
            LATINMIXMASTERS
          </span>
        </h1>
        
        {/* Subtitle */}
        <p 
          className={cn(
            "text-xl md:text-2xl text-gold-light max-w-3xl mx-auto mb-10",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.5s" }}
        >
          INTERNATIONAL DJ CREW
        </p>
        
        {/* CTA buttons */}
        <div 
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.7s" }}
        >
          <Link
            to="/stations"
            className="px-8 py-4 bg-gold text-black rounded-full font-medium flex items-center gap-2 hover:bg-gold-dark transition-colors duration-300 shadow-md"
          >
            <Radio className="w-5 h-5" />
            Browse Stations
          </Link>
          
          <Link
            to="/mixes"
            className="px-8 py-4 bg-transparent border-2 border-gold/30 backdrop-blur-sm text-gold rounded-full font-medium flex items-center gap-2 hover:bg-gold/10 transition-colors duration-300"
          >
            <Music className="w-5 h-5" />
            Mixes
          </Link>
        </div>
        
        {/* Stats container */}
        <div 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.9s" }}
        >
          {[
            { label: "Radio Stations", value: "7+" },
            { label: "DJs", value: "20+" },
            { label: "Active Listeners", value: "1M+" }
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-md bg-gold/10 dark:bg-gold/5 rounded-xl p-6 border border-gold/20">
              <div className="text-3xl sm:text-4xl font-bold text-gold">{stat.value}</div>
              <div className="text-gold-light/90 text-sm sm:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Wave decoration at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="var(--wave-fill, #ffffff)" 
            fillOpacity="1" 
            d="M0,64L60,64C120,64,240,64,360,74.7C480,85,600,107,720,101.3C840,96,960,64,1080,48C1200,32,1320,32,1380,32L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
