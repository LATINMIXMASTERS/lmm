
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Shield, LogOut, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from './types';

interface MobileMenuProps {
  navLinks: NavLink[];
  isMobileMenuOpen: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ navLinks, isMobileMenuOpen }) => {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  return (
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
                ? 'bg-gold/10 text-gold' 
                : 'text-white hover:bg-white/5'
            )}
          >
            {link.icon}
            <span className="text-lg">{link.name}</span>
          </Link>
        ))}
        
        {/* Profile Link in Mobile Menu (only for authenticated users) */}
        {isAuthenticated && (
          <Link
            to={user?.isRadioHost ? `/host/${user.id}` : `/user/${user.id}`}
            className={cn(
              'flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300',
              (location.pathname === `/user/${user?.id}` || location.pathname === `/host/${user?.id}`)
                ? 'bg-gold/10 text-gold' 
                : 'text-white hover:bg-white/5'
            )}
          >
            <User className="w-4 h-4" />
            <span className="text-lg">My Profile</span>
          </Link>
        )}
        
        {/* Host Dashboard Link in Mobile Menu (only for hosts) */}
        {isAuthenticated && user?.isRadioHost && (
          <Link
            to="/host-dashboard"
            className={cn(
              'flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300',
              location.pathname === '/host-dashboard' 
                ? 'bg-gold/10 text-gold' 
                : 'text-white hover:bg-white/5'
            )}
          >
            <Headphones className="w-4 h-4" />
            <span className="text-lg">Host Dashboard</span>
          </Link>
        )}
        
        {/* Admin Dashboard Link in Mobile Menu (only for admins) */}
        {isAuthenticated && user?.isAdmin && (
          <Link
            to="/admin"
            className={cn(
              'flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300',
              location.pathname === '/admin' 
                ? 'bg-gold/10 text-gold' 
                : 'text-white hover:bg-white/5'
            )}
          >
            <Shield className="w-4 h-4" />
            <span className="text-lg">Admin Dashboard</span>
          </Link>
        )}
        
        {/* Mobile auth links */}
        {isAuthenticated ? (
          <button
            onClick={logout}
            className="flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors duration-300 text-white hover:bg-white/5"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-lg">Sign out</span>
          </button>
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
  );
};

export default MobileMenu;
