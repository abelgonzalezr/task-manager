import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { isAuthenticated, logout, getCurrentUser } from '../services/authService';

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is authenticated on mount
    const authStatus = isAuthenticated();
    setIsLoggedIn(authStatus);

    // Get user info from local storage
    if (authStatus) {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
    }
  }, []);

  // Update isLoggedIn when user changes
  useEffect(() => {
    setIsLoggedIn(!!user);
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, setUser, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 