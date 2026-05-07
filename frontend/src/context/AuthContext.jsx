import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({ baseURL: '/api' });
api.interceptors.request.use(config => {
  const token = localStorage.getItem('school_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export { api };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('school_token');
    const saved = localStorage.getItem('school_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      api.get('/auth/me').then(r => {
        setUser(r.data.user);
        localStorage.setItem('school_user', JSON.stringify(r.data.user));
      }).catch(() => {
        localStorage.removeItem('school_token');
        localStorage.removeItem('school_user');
        setUser(null);
      }).finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('school_token', res.data.token);
    localStorage.setItem('school_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('school_token');
    localStorage.removeItem('school_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
