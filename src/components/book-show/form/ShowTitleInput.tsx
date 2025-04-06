
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ShowTitleInputProps {
  title: string;
  setTitle: (title: string) => void;
}

const ShowTitleInput: React.FC<ShowTitleInputProps> = ({
  title,
  setTitle,
}) => {
  return (
    <div>
      <Label htmlFor="title">Show Title</Label>
      <Input
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter your show title"
      />
    </div>
  );
};

export default ShowTitleInput;
