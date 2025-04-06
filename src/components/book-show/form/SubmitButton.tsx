
import React from 'react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  isPrivilegedUser: boolean;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isPrivilegedUser,
}) => {
  return (
    <Button type="submit" className="w-full">
      {isPrivilegedUser ? 'Book Show' : 'Request Booking'}
    </Button>
  );
};

export default SubmitButton;
