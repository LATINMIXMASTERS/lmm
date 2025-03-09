
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  isRadioHost?: boolean;
  approved?: boolean;
  pendingApproval?: boolean;
  registeredAt?: string;
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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

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
      // Initialize with admin user if no users exist
      const initialUsers = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          isAdmin: true,
          isRadioHost: true,
          approved: true,
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
        // In a real app, we would verify the password securely
        // For demo purposes, admin password is "admin", others use "password"
        const validPassword = foundUser.isAdmin ? password === 'admin' : password === 'password';
        
        if (validPassword) {
          // Only allow login for approved users or admins
          if (foundUser.approved || foundUser.isAdmin) {
            setUser(foundUser);
            localStorage.setItem('latinmixmasters_user', JSON.stringify(foundUser));
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${foundUser.username}!`,
            });
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
      rejectUser
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
