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
  const storedAvatar = sessionStorage.getItem('avatar');

  if (storedEmail && storedUserId) {
    setUser({
      email: storedEmail,
      userId: storedUserId,
      avatar: storedAvatar || null,
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
    // store avatar if backend returns it (optional)
    if (userData.avatar_url) sessionStorage.setItem('avatar', userData.avatar_url);

    setUser({
      email: userData.email,
      userId: userData.id,
      avatar: userData.avatar_url || null, // <--- important
    });

    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.message || 'Login failed',
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
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
