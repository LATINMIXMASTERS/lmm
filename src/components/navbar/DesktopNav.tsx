
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavItem } from './types';

interface DesktopNavProps {
  items: NavItem[];
  className?: string;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ 
  items, 
  className 
}) => {
  return (
    <nav className={cn('hidden md:flex items-center space-x-6', className)}>
      {items.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="text-base font-medium text-gray-dark hover:text-gold transition-colors dark:text-gray-light dark:hover:text-gold"
        >
          {item.label}
        </Link>
      ))}
      <ThemeToggle />
    </nav>
  );
};

export default DesktopNav;
