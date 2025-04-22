
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, AuthProviderProps } from './types';
import { useAuthActions } from './authActions';
import { useUserActions } from './userActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authInitialized = useRef<boolean>(false);
  const checkingAuthState = useRef<boolean>(false);
  
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Navigation not available: Component might be rendered outside Router context");
  }

  const authActions = useAuthActions(setUser, setUsers, setIsLoading, navigate, users);
  const userActions = useUserActions(setUser, setUsers, user, users);

  useEffect(() => {
    // Only run the auth initialization once to prevent re-rendering loops
    if (authInitialized.current || checkingAuthState.current) return;

    checkingAuthState.current = true;
    console.log("Initializing auth state...");
    
    const storedUser = localStorage.getItem('lmm_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User loaded from localStorage:", parsedUser.username);
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('lmm_user');
      }
    }

    const storedUsers = localStorage.getItem('lmm_users');
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.error("Error parsing stored users:", error);
        localStorage.removeItem('lmm_users');
      }
    } else {
      const initialUsers = [
        {
          id: 'official-admin',
          username: 'lmmappstore',
          email: 'lmmappstore@gmail.com',
          isAdmin: true,
          isRadioHost: true,
          approved: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=lmmadmin',
          biography: 'Official Admin of Latin Mix Masters'
        }
      ];
      setUsers(initialUsers);
      localStorage.setItem('lmm_users', JSON.stringify(initialUsers));
    }
    
    setIsLoading(false);
    authInitialized.current = true;
    checkingAuthState.current = false;
    console.log("Auth initialization complete");
  }, []);

  // Add a separate useEffect to prevent unnecessary re-renders
  const prevUserRef = useRef<User | null>(null);
  const prevUsersRef = useRef<User[]>([]);
  
  useEffect(() => {
    // Only update localStorage when user actually changes
    if (JSON.stringify(user) !== JSON.stringify(prevUserRef.current)) {
      if (user) {
        localStorage.setItem('lmm_user', JSON.stringify(user));
        console.log("User saved to localStorage:", user.username);
      } else if (prevUserRef.current) {
        // Only remove from localStorage if we're actually logging out
        localStorage.removeItem('lmm_user');
        console.log("User removed from localStorage");
      }
      prevUserRef.current = user;
    }
    
    // Only update localStorage when users array actually changes
    if (JSON.stringify(users) !== JSON.stringify(prevUsersRef.current)) {
      localStorage.setItem('lmm_users', JSON.stringify(users));
      prevUsersRef.current = [...users];
    }
  }, [user, users]);

  const contextValue: AuthContextType = {
    user,
    users,
    isAuthenticated: !!user,
    isLoading,
    ...authActions,
    ...userActions
  };

  return (
    <AuthContext.Provider value={contextValue}>
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
