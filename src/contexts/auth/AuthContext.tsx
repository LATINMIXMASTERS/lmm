
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContextType, User, AuthProviderProps } from './types';
import { useAuthActions } from './authActions';
import { useUserActions } from './userActions';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  let navigate: ReturnType<typeof useNavigate> | null = null;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Navigation not available: Component might be rendered outside Router context");
  }

  const authActions = useAuthActions(setUser, setUsers, setIsLoading, navigate, users);
  const userActions = useUserActions(setUser, setUsers, user, users);

  useEffect(() => {
    const storedUser = localStorage.getItem('lmm_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const storedUsers = localStorage.getItem('lmm_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
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
  }, []);

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
