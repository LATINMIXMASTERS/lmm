
import { User } from './types';
import { useToast } from '@/hooks/use-toast';

export const useUserActions = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  user: User | null,
  users: User[]
) => {
  const { toast } = useToast();

  const approveUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, approved: true, pendingApproval: false, isRadioHost: true } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User approved",
      description: "User has been granted radio host privileges."
    });
  };

  const rejectUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User rejected",
      description: "User has been removed from the system."
    });
  };

  const suspendUser = (userId: string) => {
    const userToSuspend = users.find(u => u.id === userId);
    if (userToSuspend?.isAdmin) {
      toast({
        title: "Operation denied",
        description: "Administrator accounts cannot be suspended.",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, suspended: true } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User suspended",
      description: "User has been suspended."
    });
  };

  const activateUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, suspended: false } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User activated",
      description: "User has been activated."
    });
  };

  const editUser = (userId: string, userData: Partial<User>) => {
    if (userId === 'official-admin' && userData.isAdmin === false) {
      toast({
        title: "Operation denied",
        description: "Cannot remove admin status from the main administrator account.",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, ...userData } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    if (user?.id === userId) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('lmm_user', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "User updated",
      description: "User information has been updated."
    });
  };

  const deleteUser = (userId: string) => {
    if (userId === 'official-admin') {
      toast({
        title: "Operation denied",
        description: "Cannot delete the main administrator account.",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    
    setUsers(updatedUsers);
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User deleted",
      description: "User has been removed from the system."
    });
  };

  const updateProfile = (userData: Partial<User>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to update your profile.",
        variant: "destructive"
      });
      return;
    }

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    
    setUsers(updatedUsers);
    
    localStorage.setItem('lmm_user', JSON.stringify(updatedUser));
    localStorage.setItem('lmm_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
    });
  };

  return {
    approveUser,
    rejectUser,
    suspendUser,
    activateUser,
    editUser,
    deleteUser,
    updateProfile
  };
};
