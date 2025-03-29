import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/contexts/auth/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface MixesHeaderProps {
  onOpenUploadDialog: () => void;
}

const MixesHeader: React.FC<MixesHeaderProps> = ({ onOpenUploadDialog }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="flex justify-between items-center mb-4">
      <h1 className="text-2xl font-bold">Mixes</h1>
      <div className="space-x-2">
        {user?.isRadioHost && (
          <Button onClick={onOpenUploadDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Upload Mix
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Genre</DropdownMenuItem>
            <DropdownMenuItem>Date</DropdownMenuItem>
            <DropdownMenuItem>Popularity</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default MixesHeader;
