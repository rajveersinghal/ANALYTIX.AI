import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL as API_BASE_URL } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing token on load
    const token = localStorage.getItem('token');
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (token) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
    } catch (err) {
      localStorage.removeItem('token');
      setError('Session expired');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setError(null);
    console.log(`[Auth] Attempting login to: ${API_BASE_URL}/auth/login`);
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await axios.post(`${API_BASE_URL}/auth/login`, params);
      console.log("[Auth] Login successful", response.data);
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      await fetchCurrentUser(access_token);
      return true;
    } catch (err) {
      console.error("[Auth] Login error:", err);
      const detail = err.response?.data?.detail || 'Login failed. Please check your network or credentials.';
      setError(detail);
      return false;
    }
  };

  const register = async (email, password, fullName) => {
    setError(null);
    console.log(`[Auth] Attempting register to: ${API_BASE_URL}/auth/register`);
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, {
        email,
        password,
        full_name: fullName
      });
      console.log("[Auth] Register successful");
      return true;
    } catch (err) {
      console.error("[Auth] Register error:", err);
      setError(err.response?.data?.detail || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
