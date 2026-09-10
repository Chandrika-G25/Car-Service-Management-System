import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('csms_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem('csms_access_token');
      if (token) {
        try {
          const profile = await authService.getProfile();
          setUser(profile);
          localStorage.setItem('csms_user', JSON.stringify(profile));
        } catch {
          // Token expired or invalid
          setUser(null);
          localStorage.removeItem('csms_access_token');
          localStorage.removeItem('csms_refresh_token');
          localStorage.removeItem('csms_user');
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, []);

  const login = async (email, password, role = null) => {
    const data = await authService.login({ email, password, role });
    localStorage.setItem('csms_access_token', data.tokens.access);
    localStorage.setItem('csms_refresh_token', data.tokens.refresh);
    localStorage.setItem('csms_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const data = await authService.register(formData);
    return data;
  };

  const logout = async () => {
    const refresh = localStorage.getItem('csms_refresh_token');
    if (refresh) {
      await authService.logout(refresh);
    }
    localStorage.removeItem('csms_access_token');
    localStorage.removeItem('csms_refresh_token');
    localStorage.removeItem('csms_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('csms_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
