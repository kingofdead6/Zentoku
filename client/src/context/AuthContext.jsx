// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { NODE_API } from '../../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem('email');
    const storedUserId = sessionStorage.getItem('userId');

    if (storedEmail && storedUserId) {
      setUser({
        email: storedEmail,
        userId: storedUserId,
      });
    }

    setLoading(false);
  }, []);

  // 🔐 EMAIL LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await axios.post(`${NODE_API}/auth/login`, {
        email,
        password,
      });

      const { user: userData } = data;

      sessionStorage.setItem('email', userData.email);
      sessionStorage.setItem('userId', userData.id);

      setUser({
        email: userData.email,
        userId: userData.id,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Login failed',
      };
    }
  };

  // 🟢 GOOGLE LOGIN
  const googleLogin = async (token) => {
    try {
      const { data } = await axios.post(
        `${NODE_API}/auth/google`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { user: userData } = data;

      sessionStorage.setItem('email', userData.email);
      sessionStorage.setItem('userId', userData.id);

      setUser({
        email: userData.email,
        userId: userData.id,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Google login failed',
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const { data } = await axios.post(`${NODE_API}/auth/register`, {
        name,
        email,
        password,
      });

      const { user: userData } = data;

      sessionStorage.setItem('email', userData.email);
      sessionStorage.setItem('userId', userData.id);

      setUser({
        email: userData.email,
        userId: userData.id,
      });

      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('email');
    sessionStorage.removeItem('userId');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    googleLogin, 
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
