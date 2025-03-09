
import React, { useEffect, useState } from 'react';
import { Play, Radio } from 'lucide-react';
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
        "relative overflow-hidden bg-gradient-to-br from-blue to-blue-dark text-white",
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
        {/* Main title */}
        <h1 
          className={cn(
            "text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          Discover the World of <br className="hidden sm:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-100">
            Digital Radio
          </span>
        </h1>
        
        {/* Subtitle */}
        <p 
          className={cn(
            "text-xl md:text-2xl text-blue-50/90 max-w-3xl mx-auto mb-10",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.4s" }}
        >
          Stream thousands of radio stations from around the world with crystal-clear audio quality.
        </p>
        
        {/* CTA buttons */}
        <div 
          className={cn(
            "flex flex-col sm:flex-row items-center justify-center gap-4 mb-16",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.6s" }}
        >
          <Link
            to="/stations"
            className="px-8 py-4 bg-white text-blue rounded-full font-medium flex items-center gap-2 hover:bg-blue-50 transition-colors duration-300 shadow-md"
          >
            <Radio className="w-5 h-5" />
            Browse Stations
          </Link>
          
          <button
            className="px-8 py-4 bg-transparent border-2 border-white/30 backdrop-blur-sm text-white rounded-full font-medium flex items-center gap-2 hover:bg-white/10 transition-colors duration-300"
          >
            <Play className="w-5 h-5" />
            Play Featured
          </button>
        </div>
        
        {/* Stats container */}
        <div 
          className={cn(
            "grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto",
            "opacity-0",
            isVisible && "animate-slide-down"
          )}
          style={{ animationDelay: "0.8s" }}
        >
          {[
            { label: "Radio Stations", value: "10,000+" },
            { label: "Countries", value: "150+" },
            { label: "Active Listeners", value: "2M+" }
          ].map((stat, index) => (
            <div key={index} className="backdrop-blur-md bg-white/10 rounded-xl p-6 border border-white/20">
              <div className="text-3xl sm:text-4xl font-bold">{stat.value}</div>
              <div className="text-blue-50/90 text-sm sm:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Wave decoration at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L60,64C120,64,240,64,360,74.7C480,85,600,107,720,101.3C840,96,960,64,1080,48C1200,32,1320,32,1380,32L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

export default Hero;
