import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('stocksmart_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login/', { username, password });
      const { access, refresh, user: userData } = res.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      localStorage.setItem('stocksmart_user', JSON.stringify(userData));
      setToken(access);
      setUser(userData);
      return { success: true };
    } catch (err) {
      let msg = 'Invalid username or password';
      if (err.response?.data?.detail) {
        msg = err.response.data.detail;
      } else if (err.code === 'ECONNABORTED') {
        msg = 'Connection timed out. Render backend may still be waking up (takes ~30-50s on free tier). Please retry in a few moments.';
      } else if (err.message === 'Network Error' || !err.response) {
        msg = 'Unable to reach backend server. If using Render free tier, the backend is likely waking up from sleep. Please try again shortly.';
      }
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('stocksmart_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        role: user?.role || 'Guest',
        isAdmin: user?.role === 'Admin' || user?.is_superuser,
        isWarehouseManager: user?.role === 'Warehouse Manager' || user?.role === 'Admin',
        isStoreAssociate: user?.role === 'Store Associate' || user?.role === 'Admin',
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
