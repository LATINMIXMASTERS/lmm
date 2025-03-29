
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
          id: 'official-admin',
          username: 'lmmappstore',
          email: 'lmmappstore@gmail.com',
          isAdmin: true,
          isRadioHost: true,
          approved: true,
          registeredAt: new Date().toISOString(),
          profileImage: 'https://api.dicebear.com/7.x/personas/svg?seed=lmmadmin',
          biography: 'Official Admin of Latin Mix Masters'
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
