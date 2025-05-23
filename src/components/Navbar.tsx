
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Radio, Music, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Logo from './navbar/Logo';
import DesktopNav from './navbar/DesktopNav';
import UserMenu from './navbar/UserMenu';
import MobileMenu from './navbar/MobileMenu';
import MobileMenuToggle from './navbar/MobileMenuToggle';
import { NavLink, NavItem } from './navbar/types';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks: NavLink[] = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Stations', path: '/stations', icon: <Radio className="w-4 h-4" /> },
    { name: 'Mixes', path: '/mixes', icon: <Music className="w-4 h-4" /> }
  ];

  // Convert NavLink[] to NavItem[] for the components
  const navItems: NavItem[] = navLinks.map(link => ({
    href: link.path,
    label: link.name
  }));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-400 px-4 md:px-8',
        isScrolled 
          ? 'py-3 glass shadow-sm' 
          : 'py-5 bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <DesktopNav items={navItems} />

        {/* User Menu (Desktop) */}
        <div className="hidden md:flex">
          <UserMenu />
        </div>

        {/* Mobile Menu Toggle */}
        <MobileMenuToggle 
          isMobileMenuOpen={isMobileMenuOpen} 
          toggleMobileMenu={toggleMobileMenu}
        />
      </div>
      
      {/* Mobile Menu */}
      <MobileMenu 
        items={navItems} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </header>
  );
};

export default Navbar;
