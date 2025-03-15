
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from './types';

interface DesktopNavProps {
  navLinks: NavLink[];
}

const DesktopNav: React.FC<DesktopNavProps> = ({ navLinks }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  return (
    <nav className="hidden md:flex items-center space-x-8">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={cn(
            'flex items-center space-x-1.5 text-sm font-medium transition-colors duration-300',
            location.pathname === link.path 
              ? 'text-gold' 
              : 'text-gray-dark hover:text-gold'
          )}
        >
          {link.icon}
          <span>{link.name}</span>
        </Link>
      ))}
      
      {/* Admin Dashboard Link (only for admins) */}
      {isAuthenticated && user?.isAdmin && (
        <Link
          to="/admin"
          className={cn(
            'flex items-center space-x-1.5 text-sm font-medium transition-colors duration-300',
            location.pathname === '/admin' 
              ? 'text-gold' 
              : 'text-gray-dark hover:text-gold'
          )}
        >
          <Shield className="w-4 h-4" />
          <span>Admin</span>
        </Link>
      )}
    </nav>
  );
};

export default DesktopNav;
