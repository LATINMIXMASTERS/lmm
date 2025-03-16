
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/contexts/AuthContext';

interface MixesHeaderProps {
  isAuthenticated: boolean;
  user: User | null;
  handleManageGenres: () => void;
  handleUpload: () => void;
}

const MixesHeader: React.FC<MixesHeaderProps> = ({ 
  isAuthenticated, 
  user, 
  handleManageGenres, 
  handleUpload 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Mixes</h1>
        <p className="text-gray-600 mb-4">Discover tracks uploaded by our DJ crew</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {isAuthenticated && (user?.isRadioHost || user?.isAdmin) && (
          <>
            <Button 
              onClick={handleManageGenres}
              variant="outline"
              className="flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Manage Genres
            </Button>
            
            <Button 
              onClick={handleUpload}
              className="bg-blue hover:bg-blue-dark text-white flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Mix
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default MixesHeader;
