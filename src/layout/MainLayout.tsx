
import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Player from '@/components/Player';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LayoutDashboard } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const { user } = useAuth();
  
  useEffect(() => {
    if (location !== displayLocation) {
      setIsTransitioning(true);
      setTransitionStage('fadeOut');
      
      const timeoutId = setTimeout(() => {
        window.scrollTo(0, 0); // Scroll to top on page change
        setDisplayLocation(location);
        setTransitionStage('fadeIn');
        
        const fadeInTimeoutId = setTimeout(() => {
          setIsTransitioning(false);
        }, 300);
        
        return () => clearTimeout(fadeInTimeoutId);
      }, 200);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location, displayLocation]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />
      
      <main 
        className={`flex-grow px-4 md:px-8 pt-16 pb-32 transition-opacity duration-300 ease-in-out ${
          transitionStage === 'fadeIn' ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {user && user.isRadioHost && location.pathname !== '/host-dashboard' && (
          <div className="fixed bottom-24 right-4 z-50">
            <Button 
              asChild 
              variant="default" 
              className="rounded-full shadow-lg p-3 h-12 w-12 bg-gold hover:bg-gold-dark dark:bg-gold dark:hover:bg-gold-dark"
            >
              <Link to="/host-dashboard">
                <LayoutDashboard className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
        {children}
      </main>
      
      <Player />
      <Footer />
    </div>
  );
};

export default MainLayout;
