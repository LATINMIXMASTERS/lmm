
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'lucide-react';

interface EmptyBookingsListProps {
  message: string;
  showBookButton?: boolean;
  icon?: ReactNode;
}

export const EmptyBookingsList: React.FC<EmptyBookingsListProps> = ({
  message,
  showBookButton = false,
  icon
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="text-center py-8">
      {icon || <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />}
      <p className="text-muted-foreground">{message}</p>
      {showBookButton && (
        <Button 
          className="mt-4" 
          onClick={() => navigate('/stations')}
        >
          Book a Show
        </Button>
      )}
    </div>
  );
};
