import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as apiService from '../services/apiService';
import { setAccessToken, getAccessToken } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAccessToken());
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize auth state by verifying stored token
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      const storedToken = getAccessToken();
      if (!storedToken) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const currentUser = await apiService.getMe();
        if (isMounted && currentUser) {
          setUser(currentUser);
          setToken(storedToken);
        } else if (isMounted) {
          setAccessToken(null);
          setUser(null);
          setToken(null);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Auth token verification failed or expired:', err?.response?.data || err.message);
          setAccessToken(null);
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    setAuthError(null);
    try {
      const res = await apiService.loginUser({ email, password });
      if (res && res.access_token) {
        setAccessToken(res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Invalid response from authentication server');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Failed to log in. Please check your credentials.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setAuthError(null);
    try {
      const res = await apiService.registerUser(userData);
      if (res && res.access_token) {
        setAccessToken(res.access_token);
        setToken(res.access_token);
        setUser(res.user);
        return { success: true, user: res.user };
      }
      throw new Error('Invalid response from registration server');
    } catch (err) {
      const errorMsg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setAuthError(errorMsg);
      throw new Error(errorMsg);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiService.logoutUser();
    } catch (e) {
      console.warn('Error during logout API call:', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      setToken(null);
      setAuthError(null);
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    authError,
    login,
    register,
    logout,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
