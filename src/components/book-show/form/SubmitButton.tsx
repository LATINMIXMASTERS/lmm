
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Send } from 'lucide-react';

interface SubmitButtonProps {
  isPrivilegedUser: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isPrivilegedUser,
}) => {
  return (
    <Button type="submit" className="w-full">
      {isPrivilegedUser ? (
        <>
          <Calendar className="mr-2 h-4 w-4" />
          Book Show
        </>
      ) : (
        <>
          <Send className="mr-2 h-4 w-4" />
          Request Booking
        </>
      )}
    </Button>
  );
};

export default SubmitButton;
