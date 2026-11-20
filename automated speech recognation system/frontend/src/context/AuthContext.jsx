import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('speechsense_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.getMe();
        setUser(res.data);
      } catch (e) {
        setUser({
          user_id: 'guest_demo',
          name: 'Guest Researcher',
          email: 'guest@speechsense.ai',
          is_guest: true
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('speechsense_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.register({ name, email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('speechsense_token', access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('speechsense_token');
    setToken(null);
    setUser({
      user_id: 'guest_demo',
      name: 'Guest Researcher',
      email: 'guest@speechsense.ai',
      is_guest: true
    });
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
