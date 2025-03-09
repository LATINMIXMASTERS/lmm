
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('waveradio_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login functionality (replace with real auth later)
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would validate credentials with a backend
      if (email === 'demo@example.com' && password === 'password') {
        const mockUser = {
          id: '1',
          username: 'demo_user',
          email: 'demo@example.com',
          isAdmin: false
        };
        setUser(mockUser);
        localStorage.setItem('waveradio_user', JSON.stringify(mockUser));
        toast({
          title: "Login successful",
          description: "Welcome back to WaveRadio!",
        });
        return;
      }
      toast({
        title: "Login failed",
        description: "Invalid email or password. Try demo@example.com / password",
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

  // Mock register functionality (replace with real auth later)
  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, we would send the data to a backend
      const mockUser = {
        id: Math.random().toString(36).substring(2, 11),
        username,
        email,
        isAdmin: false
      };
      setUser(mockUser);
      localStorage.setItem('waveradio_user', JSON.stringify(mockUser));
      toast({
        title: "Registration successful",
        description: "Welcome to WaveRadio!",
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
    localStorage.removeItem('waveradio_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout 
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
