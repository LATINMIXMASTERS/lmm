
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Radio, Music, Info, Home, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> },
    { name: 'Stations', path: '/stations', icon: <Radio className="w-4 h-4" /> },
    { name: 'About', path: '/about', icon: <Info className="w-4 h-4" /> }
  ];

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
        <Link 
          to="/"
          className="flex items-center space-x-2 group"
        >
          <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center text-white transition-transform duration-400 group-hover:scale-110">
            <Music className="w-5 h-5" />
          </div>
          <span className="text-xl font-medium">WaveRadio</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center space-x-1.5 text-sm font-medium transition-colors duration-300',
                location.pathname === link.path 
                  ? 'text-blue' 
                  : 'text-gray-dark hover:text-blue'
              )}
            >
              {link.icon}
              <span>{link.name}</span>
            </Link>
          ))}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/go-live"
                className="py-2 px-4 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors duration-300"
              >
                Go Live
              </Link>
              <div className="flex items-center space-x-2 group cursor-pointer">
                <div className="w-8 h-8 bg-blue/10 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue" />
                </div>
                <div className="relative group">
                  <div className="flex items-center space-x-1">
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="py-1">
                      <button
                        onClick={logout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-lightest"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 py-2 px-4 border border-gray-light rounded-lg text-sm font-medium hover:bg-gray-lightest transition-colors duration-300"
            >
              <User className="w-4 h-4" />
              <span>Sign in</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-gray-dark hover:text-blue transition-colors duration-300"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div
        className={cn(
          'fixed inset-0 z-40 glass-dark pt-20 pb-6 px-6 md:hidden flex flex-col transition-all duration-400',
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <nav className="flex flex-col space-y-4 mt-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300',
                location.pathname === link.path 
                  ? 'bg-blue/10 text-blue' 
                  : 'text-white hover:bg-white/5'
              )}
            >
              {link.icon}
              <span className="text-lg">{link.name}</span>
            </Link>
          ))}
          
          {/* Mobile auth links */}
          {isAuthenticated ? (
            <>
              <Link
                to="/go-live"
                className="flex items-center space-x-3 py-3 px-4 bg-red-500 text-white rounded-lg transition-colors duration-300"
              >
                <Radio className="w-4 h-4" />
                <span className="text-lg">Go Live</span>
              </Link>
              <button
                onClick={logout}
                className="flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300 text-white hover:bg-white/5"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-lg">Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-3 py-3 px-4 border border-white/20 text-white rounded-lg hover:bg-white/5 transition-colors duration-300"
            >
              <User className="w-4 h-4" />
              <span className="text-lg">Sign in</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
