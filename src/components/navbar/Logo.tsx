
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const Logo: React.FC = () => {
  return (
    <Link 
      to="/"
      className="flex items-center space-x-2 group"
    >
      <div className="w-auto h-10 flex items-center justify-center">
        <img 
          src="/lovable-uploads/1c428522-a0bb-44a9-8f08-2afd85e478ed.png" 
          alt="LATINMIXMASTERS Logo" 
          className="h-10 transition-transform duration-400 group-hover:scale-110"
        />
      </div>
    </Link>
  );
};

export default Logo;
