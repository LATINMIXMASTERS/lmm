
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
      <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white transition-transform duration-400 group-hover:scale-110">
        <Music className="w-5 h-5" />
      </div>
      <span className="text-xl font-medium">LATINMIXMASTERS</span>
    </Link>
  );
};

export default Logo;
