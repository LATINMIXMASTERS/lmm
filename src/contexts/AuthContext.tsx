
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Export the User interface so it can be imported elsewhere
export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  isRadioHost?: boolean;
  approved?: boolean;
  pendingApproval?: boolean;
  registeredAt?: string;
  suspended?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  editUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('latinmixmasters_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Load all users from localStorage
    const storedUsers = localStorage.getItem('latinmixmasters_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      // Initialize with admin user and test accounts if no users exist
      const initialUsers = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          isAdmin: true,
          isRadioHost: true,
          approved: true,
          registeredAt: new Date().toISOString()
        },
        {
          id: '2',
          username: 'testhost',
          email: 'testhost@example.com',
          isAdmin: false,
          isRadioHost: true,
          approved: true,
          pendingApproval: false,
          registeredAt: new Date().toISOString()
        },
        {
          id: '3',
          username: 'testuser',
          email: 'testuser@example.com',
          isAdmin: false,
          isRadioHost: false,
          approved: true,
          pendingApproval: false,
          registeredAt: new Date().toISOString()
        }
      ];
      setUsers(initialUsers);
      localStorage.setItem('latinmixmasters_users', JSON.stringify(initialUsers));
    }
    
    setIsLoading(false);
  }, []);

  // Mock login functionality (replace with real auth later)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in our local storage
      const storedUsers = localStorage.getItem('latinmixmasters_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      const foundUser = allUsers.find((u: User) => u.email.toLowerCase() === email.toLowerCase());
      
      if (foundUser) {
        // For test accounts, we'll use the same password for simplicity
        const isTestAccount = 
          (foundUser.email === 'testhost@example.com' || 
           foundUser.email === 'testuser@example.com');
        
        // In a real app, we would verify the password securely
        // For demo purposes:
        // - admin password is "admin"
        // - test accounts use "test123"
        // - others use "password"
        const validPassword = 
          foundUser.isAdmin ? password === 'admin' : 
          isTestAccount ? password === 'test123' :
          password === 'password';
        
        if (validPassword) {
          // Only allow login for approved users or admins
          if (foundUser.approved || foundUser.isAdmin) {
            // Check if user is suspended
            if (foundUser.suspended) {
              toast({
                title: "Account suspended",
                description: "Your account has been suspended. Please contact an administrator.",
                variant: "destructive"
              });
              setIsLoading(false);
              return;
            }
            
            setUser(foundUser);
            localStorage.setItem('latinmixmasters_user', JSON.stringify(foundUser));
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${foundUser.username}!`,
            });
            
            // Redirect to home page after successful login
            navigate('/');
            
            setIsLoading(false);
            return;
          } else {
            toast({
              title: "Account pending approval",
              description: "Your account is waiting for admin approval.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
        }
      }
      
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Register functionality
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const storedUsers = localStorage.getItem('latinmixmasters_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      if (allUsers.some((u: User) => u.email.toLowerCase() === email.toLowerCase())) {
        toast({
          title: "Registration failed",
          description: "A user with this email already exists.",
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }
      
      // Create new user
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        username,
        email,
        isAdmin: false,
        isRadioHost: false,
        approved: false,
        pendingApproval: true,
        registeredAt: new Date().toISOString()
      };
      
      // Add to users list
      const updatedUsers = [...allUsers, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
      
      toast({
        title: "Registration successful",
        description: "Your account is pending approval by an admin.",
      });
    } catch (error) {
      toast({
        title: "Registration error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('latinmixmasters_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // Redirect to home page after logout
    navigate('/');
  };

  const approveUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, approved: true, pendingApproval: false, isRadioHost: true } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User approved",
      description: "User has been granted radio host privileges."
    });
  };

  const rejectUser = (userId: string) => {
    const updatedUsers = users.filter(u => u.id !== userId);
    
    setUsers(updatedUsers);
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User rejected",
      description: "User has been removed from the system."
    });
  };

  // New function to suspend a user
  const suspendUser = (userId: string) => {
    // Cannot suspend admin
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
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    // If the suspended user is currently logged in, log them out
    if (user?.id === userId) {
      logout();
    }
    
    toast({
      title: "User suspended",
      description: "User has been suspended."
    });
  };

  // New function to activate a suspended user
  const activateUser = (userId: string) => {
    const updatedUsers = users.map(u => 
      u.id === userId ? { ...u, suspended: false } : u
    );
    
    setUsers(updatedUsers);
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User activated",
      description: "User has been activated."
    });
  };

  // New function to edit a user
  const editUser = (userId: string, userData: Partial<User>) => {
    // Cannot remove admin status from the main admin account
    if (userId === '1' && userData.isAdmin === false) {
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
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    // If the edited user is currently logged in, update their session
    if (user?.id === userId) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('latinmixmasters_user', JSON.stringify(updatedUser));
    }
    
    toast({
      title: "User updated",
      description: "User information has been updated."
    });
  };

  // New function to delete a user
  const deleteUser = (userId: string) => {
    // Cannot delete the main admin account
    if (userId === '1') {
      toast({
        title: "Operation denied",
        description: "Cannot delete the main administrator account.",
        variant: "destructive"
      });
      return;
    }

    const updatedUsers = users.filter(u => u.id !== userId);
    
    setUsers(updatedUsers);
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    // If the deleted user is currently logged in, log them out
    if (user?.id === userId) {
      logout();
    }
    
    toast({
      title: "User deleted",
      description: "User has been removed from the system."
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout,
      approveUser,
      rejectUser,
      suspendUser,
      activateUser,
      editUser,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
