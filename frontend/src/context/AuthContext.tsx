import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/user';
import { authApi } from '../api/auth';
import { userApi } from '../api/users';
import { useToast } from './ToastContext';
import { getErrorMessage } from '../utils/errorHandler';

interface AuthContextType extends AuthState {
  login: (email: string, pass: string) => Promise<boolean>;
  loginDemo: (role?: 'patient' | 'admin') => Promise<void>;
  register: (data: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    // Check saved session
    const savedToken = localStorage.getItem('dermalytics_token');
    const savedUser = localStorage.getItem('dermalytics_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dermalytics_token');
        localStorage.removeItem('dermalytics_user');
      }
    } else {
      // Default to demo session for instant accessibility
      const defaultDemoUser: User = {
        id: 'demo-user-100',
        email: 'demo@dermalytics.com',
        username: 'demo_patient',
        first_name: 'Ayesha',
        last_name: 'Khan',
        gender: 'Female',
        is_admin: false,
        is_verified: true,
        created_at: new Date().toISOString()
      };
      setUser(defaultDemoUser);
      setToken('demo-jwt-token-active');
      localStorage.setItem('dermalytics_user', JSON.stringify(defaultDemoUser));
      localStorage.setItem('dermalytics_token', 'demo-jwt-token-active');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.login(email, pass);
      if (res.status === 'success' && res.data) {
        const u = res.data.user;
        const tok = res.data.access_token;
        setUser(u);
        setToken(tok);
        localStorage.setItem('dermalytics_user', JSON.stringify(u));
        localStorage.setItem('dermalytics_token', tok);
        showToast(`Welcome back, ${u.first_name || u.username}!`, 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(getErrorMessage(err), 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loginDemo = async (role: 'patient' | 'admin' = 'patient') => {
    setIsLoading(true);
    const demoUser: User = role === 'admin' ? {
      id: 'admin-user-001',
      email: 'admin@dermalytics.com',
      username: 'dr_khurram',
      first_name: 'Dr. Khurram',
      last_name: 'Iqbal',
      gender: 'Male',
      is_admin: true,
      is_verified: true,
      created_at: '2026-08-01T09:00:00Z'
    } : {
      id: 'demo-user-100',
      email: 'demo@dermalytics.com',
      username: 'demo_patient',
      first_name: 'Ayesha',
      last_name: 'Khan',
      gender: 'Female',
      is_admin: false,
      is_verified: true,
      created_at: '2026-08-10T11:00:00Z'
    };

    setUser(demoUser);
    setToken(`demo-${role}-jwt-token`);
    localStorage.setItem('dermalytics_user', JSON.stringify(demoUser));
    localStorage.setItem('dermalytics_token', `demo-${role}-jwt-token`);
    setIsLoading(false);
    showToast(`Logged in as Demo ${role === 'admin' ? 'Administrator' : 'Patient'}`, 'success');
  };

  const register = async (data: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authApi.register(data);
      if (res.status === 'success') {
        showToast('Registration successful! Please log in.', 'success');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast(getErrorMessage(err), 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dermalytics_token');
    localStorage.removeItem('dermalytics_user');
    showToast('Logged out successfully', 'info');
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updated = { ...user, ...data };
      setUser(updated);
      localStorage.setItem('dermalytics_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginDemo,
        register,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
