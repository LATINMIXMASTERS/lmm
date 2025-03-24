
import React from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavItem } from './types';
import UserMenu from './UserMenu';

interface MobileMenuProps {
  items: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const MobileMenu: React.FC<MobileMenuProps> = ({
  items,
  isOpen,
  onClose,
  className
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-background md:hidden',
        className
      )}
    >
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-0 text-center sm:items-center sm:p-0">
          <div
            className="relative transform overflow-hidden rounded-t-xl bg-background px-5 py-6 w-full transition-all sm:rounded-xl"
          >
            <div className="absolute right-4 top-4">
              <button
                type="button"
                className="text-gray-dark hover:text-gold dark:text-gray-light dark:hover:text-gold"
                onClick={onClose}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 sm:mt-6">
              <nav className="flex flex-col space-y-8">
                {items.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className="text-lg font-medium text-gray-dark hover:text-gold dark:text-gray-light dark:hover:text-gold text-center"
                    onClick={onClose}
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="flex justify-center mt-4">
                  <ThemeToggle />
                </div>
                
                {/* Add User Menu for mobile */}
                <UserMenu />
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
