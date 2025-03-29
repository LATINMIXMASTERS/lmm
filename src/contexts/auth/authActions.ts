
import { User } from './types';
import { useToast } from '@/hooks/use-toast';
import { NavigateFunction } from 'react-router-dom';
import { usePasswordResetActions } from './passwordResetActions';

export const useAuthActions = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  navigate: NavigateFunction | null,
  users: User[]
) => {
  const { toast } = useToast();
  const passwordResetActions = usePasswordResetActions(setIsLoading);

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
          'lmmappstore@gmail.com': '3509Willie!',
          'djlatino@example.com': 'password123',
          'bachataqueen@example.com': 'password123',
          'reggaetonmaster@example.com': 'password123',
          'salsaking@example.com': 'password123'
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
              description: "Your account has been automatically approved.",
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

  return {
    login,
    register,
    logout,
    ...passwordResetActions
  };
};
