
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '@/contexts/auth/types';
import ProfileEditor from '@/components/ProfileEditor';
import { useToast } from '@/hooks/use-toast';

interface UserProfileEditorProps {
  profileUser: User;
  updateProfile: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const UserProfileEditor: React.FC<UserProfileEditorProps> = ({ 
  profileUser, 
  updateProfile, 
  onCancel 
}) => {
  const { toast } = useToast();
  
  const handleProfileUpdate = (userData: Partial<typeof profileUser>) => {
    updateProfile(userData);
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated"
    });
  };

  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6">
        <button 
          className="px-4 py-2 border rounded hover:bg-gray-50"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
      <ProfileEditor 
        user={profileUser} 
        onSave={handleProfileUpdate} 
      />
    </div>
  );
};

export default UserProfileEditor;
