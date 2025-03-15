
import React from 'react';
import { Link } from 'react-router-dom';
import { Music } from 'lucide-react';
import { cn } from '@/lib/utils';

const Logo: React.FC = () => {
  return (
    <Link 
      to="/"
      className="flex items-center space-x-2 group"
    >
      <div className="w-auto h-10 flex items-center justify-center">
        <img 
          src="/lovable-uploads/42fbeaeb-8383-46a5-99ec-9eade511c5a3.png" 
          alt="LATINMIXMASTERS Logo" 
          className="h-10 transition-transform duration-400 group-hover:scale-110"
        />
      </div>
    </Link>
  );
};

export default Logo;
