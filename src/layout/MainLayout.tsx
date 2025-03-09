
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import Footer from '@/components/Footer';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  
  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      setTransitionStage('fadeOut');
      
      const timeoutId = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
        
        const fadeInTimeoutId = setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
        
        return () => clearTimeout(fadeInTimeoutId);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location, displayLocation]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main 
        className={`flex-grow px-4 md:px-8 pt-16 pb-24 transition-opacity duration-500 ease-in-out ${
          transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </main>
      
      <Player />
      <Footer />
    </div>
  );
};

export default MainLayout;
