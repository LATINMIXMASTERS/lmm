import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

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
  profileImage?: string;
  biography?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
  };
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
  updateProfile: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Navigation not available: Component might be rendered outside Router context");
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('latinmixmasters_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedUsers = localStorage.getItem('latinmixmasters_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const initialUsers = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@example.com',
          isAdmin: true,
          isRadioHost: true,
          approved: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=admin',
          biography: 'Admin of Latin Mix Masters'
        },
        {
          id: '2',
          username: 'testhost',
          email: 'testhost@example.com',
          isAdmin: false,
          isRadioHost: true,
          approved: true,
          pendingApproval: false,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=testhost',
          biography: 'Test radio host account'
        },
        {
          id: '3',
          username: 'testuser',
          email: 'testuser@example.com',
          isAdmin: false,
          isRadioHost: false,
          approved: true,
          pendingApproval: false,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=testuser',
          biography: 'Test user account'
        },
        {
          id: 'host1',
          username: 'DJLatino',
          email: 'djlatino@example.com',
          password: 'password123',
          isAdmin: false,
          isRadioHost: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
          biography: 'Passionate Latin music DJ with over 10 years of experience in the industry.',
          socialLinks: {
            facebook: 'https://facebook.com/djlatino',
            twitter: 'https://twitter.com/djlatino',
            instagram: 'https://instagram.com/djlatino',
            youtube: null,
            soundcloud: 'https://soundcloud.com/djlatino'
          }
        },
        {
          id: 'host2',
          username: 'BachataQueen',
          email: 'bachataqueen@example.com',
          password: 'password123',
          isAdmin: false,
          isRadioHost: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
          biography: 'Dedicated to bringing you the best bachata mixes from around the world.',
          socialLinks: {
            facebook: 'https://facebook.com/bachataqueen',
            twitter: null,
            instagram: 'https://instagram.com/bachataqueen',
            youtube: 'https://youtube.com/bachataqueen',
            soundcloud: null
          }
        },
        {
          id: 'host3',
          username: 'ReggaetonMaster',
          email: 'reggaetonmaster@example.com',
          password: 'password123',
          isAdmin: false,
          isRadioHost: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop',
          biography: 'Bringing you the hottest reggaeton tracks from Puerto Rico and beyond.',
          socialLinks: {
            facebook: null,
            twitter: 'https://twitter.com/reggaetonmaster',
            instagram: 'https://instagram.com/reggaetonmaster',
            youtube: null,
            soundcloud: 'https://soundcloud.com/reggaetonmaster'
          }
        },
        {
          id: 'host4',
          username: 'SalsaKing',
          email: 'salsaking@example.com',
          password: 'password123',
          isAdmin: false,
          isRadioHost: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop',
          biography: 'Professional salsa DJ with a passion for Cuban and Puerto Rican rhythms.',
          socialLinks: {
            facebook: 'https://facebook.com/salsaking',
            twitter: 'https://twitter.com/salsaking',
            instagram: 'https://instagram.com/salsaking',
            youtube: 'https://youtube.com/salsaking',
            soundcloud: 'https://soundcloud.com/salsaking'
          }
        }
      ];
      setUsers(initialUsers);
      localStorage.setItem('latinmixmasters_users', JSON.stringify(initialUsers));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      console.log("Login attempt with:", email, password);
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedUsers = localStorage.getItem('latinmixmasters_users');
      const allUsers = storedUsers ? JSON.parse(storedUsers) : [];
      
      console.log("Available users:", allUsers);
      
      const foundUser = allUsers.find((u: User) => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      console.log("Found user:", foundUser);
      
      if (foundUser) {
        const userPasswords: Record<string, string> = {
          'admin@example.com': 'admin',
          'testhost@example.com': 'test123',
          'testuser@example.com': 'test123',
          'test@gmail.com': '123456'
        };
        
        let validPassword = false;
        
        if (userPasswords[foundUser.email.toLowerCase()]) {
          validPassword = password === userPasswords[foundUser.email.toLowerCase()];
        } else {
          validPassword = password === 'password' || password === foundUser.password;
        }
        
        console.log("Password valid:", validPassword);
        
        if (validPassword) {
          if (foundUser.suspended) {
            toast({
              title: "Account suspended",
              description: "Your account has been suspended. Please contact an administrator.",
              variant: "destructive"
            });
            setIsLoading(false);
            return;
          }
          
          if (!foundUser.approved && foundUser.pendingApproval) {
            foundUser.approved = true;
            foundUser.pendingApproval = false;
            
            const updatedUsers = allUsers.map((u: User) => 
              u.id === foundUser.id ? foundUser : u
            );
            setUsers(updatedUsers);
            localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
            
            toast({
              title: "Account approved",
              description: "Your account has been automatically approved for testing.",
            });
          }
          
          if (foundUser.approved || foundUser.isAdmin) {
            setUser(foundUser);
            localStorage.setItem('latinmixmasters_user', JSON.stringify(foundUser));
            
            toast({
              title: "Login successful",
              description: `Welcome back, ${foundUser.username}!`,
            });
            
            if (navigate) {
              navigate('/');
            }
          } else {
            toast({
              title: "Account pending approval",
              description: "Your account is waiting for admin approval.",
              variant: "destructive"
            });
          }
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Login failed",
          description: "User not found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Register attempt:", { username, email });
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
      
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        username,
        email,
        password,
        isAdmin: false,
        isRadioHost: false,
        approved: true,
        pendingApproval: false,
        registeredAt: new Date().toISOString(),
        profileImage: `https://api.dicebear.com/7.x/personas/svg?seed=${username}`
      };
      
      const updatedUsers = [...allUsers, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
      
      toast({
        title: "Registration successful",
        description: "You can now log in with your new account.",
      });
      
      setUser(newUser);
      localStorage.setItem('latinmixmasters_user', JSON.stringify(newUser));
      
      if (navigate) {
        navigate('/');
      }
      
    } catch (error) {
      console.error("Registration error:", error);
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
    if (navigate) {
      navigate('/');
    }
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
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    if (user?.id === userId) {
      logout();
    }
    
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
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "User activated",
      description: "User has been activated."
    });
  };

  const editUser = (userId: string, userData: Partial<User>) => {
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

  const deleteUser = (userId: string) => {
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
    
    if (user?.id === userId) {
      logout();
    }
    
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
    
    localStorage.setItem('latinmixmasters_user', JSON.stringify(updatedUser));
    localStorage.setItem('latinmixmasters_users', JSON.stringify(updatedUsers));
    
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated."
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
      deleteUser,
      updateProfile
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
