
import React from 'react';
import { Menu, X } from 'lucide-react';

interface MobileMenuToggleProps {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

const MobileMenuToggle: React.FC<MobileMenuToggleProps> = ({ 
  isMobileMenuOpen, 
  toggleMobileMenu 
}) => {
  return (
    <button
      className="md:hidden text-gray-dark hover:text-gold transition-colors duration-300"
      onClick={toggleMobileMenu}
      aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
    >
      {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
};

export default MobileMenuToggle;
