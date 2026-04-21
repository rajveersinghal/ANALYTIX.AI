import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, BASE_URL as API_BASE_URL } from '../api/api';

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
      const response = await api.get('/auth/me');
      setUser(response);
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

      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      console.log("[Auth] Login response received", response);
      const { access_token } = response;
      
      localStorage.setItem('token', access_token);
      await fetchCurrentUser(access_token);
      return true;
    } catch (err) {
      console.error("[Auth] Login error details:", err);
      
      let errorMessage = "An error occurred during login.";
      
      if (!err.response) {
        errorMessage = "We're having trouble reaching our servers. Please check your internet connection and try again.";
      } else if (err.response.status === 503) {
        errorMessage = "Our service is currently undergoing a brief update. Please try again in a few minutes.";
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      setError(errorMessage);
      return false;
    }
  };

  const register = async (email, password, fullName) => {
    setError(null);
    console.log(`[Auth] Attempting register to: ${API_BASE_URL}/auth/register`);
    try {
      await api.post('/auth/register', {
        email,
        password,
        full_name: fullName
      });
      console.log("[Auth] Register successful");
      return true;
    } catch (err) {
      console.error("[Auth] Register error details:", err);
      
      let errorMessage = "Registration failed.";
      
      if (!err.response) {
        errorMessage = "We're having trouble reaching our servers. Please check your internet connection and try again.";
      } else if (err.response.data?.detail) {
        errorMessage = err.response.data.detail;
      }
      
      setError(errorMessage);
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

export { AuthContext };
