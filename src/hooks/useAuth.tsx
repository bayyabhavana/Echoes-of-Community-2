import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  token?: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  followers?: string[];
  following?: string[];
  followersCount?: number;
  followingCount?: number;
  joinedDate?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem('echoes_user');
    const storedToken = localStorage.getItem('echoes_token');

    if (storedUser && storedToken) {
      const userData = JSON.parse(storedUser);
      setUser({ ...userData, token: storedToken });
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const { token, ...userData } = data;

      setUser({ ...userData, token });
      localStorage.setItem('echoes_user', JSON.stringify(userData));
      localStorage.setItem('echoes_token', token);
      setIsLoading(false);
    } catch (error: unknown) {
      setIsLoading(false);
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }

      const data = await response.json();
      const { token, ...userData } = data;

      setUser({ ...userData, token });
      localStorage.setItem('echoes_user', JSON.stringify(userData));
      localStorage.setItem('echoes_token', token);
      setIsLoading(false);
    } catch (error: unknown) {
      setIsLoading(false);
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const resetPassword = async (email: string, newPassword: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Password reset failed');
      }

      setIsLoading(false);
    } catch (error: unknown) {
      setIsLoading(false);
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('echoes_user');
    localStorage.removeItem('echoes_token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, resetPassword, logout, isLoading }}>
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
