
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, LogOut, Headphones } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserMenu: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="hidden md:flex items-center space-x-4">
      {isAuthenticated ? (
        <div className="flex items-center space-x-4">
          <div className="relative group">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-gold/10 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gold" />
              </div>
              <span className="text-sm font-medium">{user?.username}</span>
            </div>
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <Link
                  to={user?.isRadioHost ? `/host/${user.id}` : `/profile/${user.id}`}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-lightest"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                {user?.isRadioHost && (
                  <Link
                    to="/host-dashboard"
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-lightest"
                  >
                    <Headphones className="w-4 h-4" />
                    <span>Host Dashboard</span>
                  </Link>
                )}
                {user?.isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-lightest"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-lightest"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Link
          to="/login"
          className="flex items-center space-x-1.5 py-2 px-4 border border-gray-light rounded-lg text-sm font-medium hover:bg-gray-lightest transition-colors duration-300"
        >
          <User className="w-4 h-4" />
          <span>Sign in</span>
        </Link>
      )}
    </div>
  );
};

export default UserMenu;
