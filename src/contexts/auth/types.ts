
import { ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
  isRadioHost?: boolean;
  registeredAt?: string;
  profileImage?: string;
  suspended?: boolean;
  pendingApproval?: boolean;
  bio?: string;
  biography?: string;
  password?: string;
  approved?: boolean;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    soundcloud?: string;
    youtube?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  approveUser: (userId: string) => void;
  rejectUser: (userId: string) => void;
  suspendUser: (userId: string) => void;
  activateUser: (userId: string) => void;
  editUser: (userId: string, userData: Partial<User>) => void;
  deleteUser: (userId: string) => void;
  updateProfile: (userData: Partial<User>) => void;
}

export interface AuthProviderProps {
  children: ReactNode;
}
