import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth";
import { api, setAuthToken } from "../lib/api"; 


const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Lấy user + token từ localStorage khi app load
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      const savedToken = localStorage.getItem("token");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      if (savedToken) {
        setAuthToken(savedToken); // 👈 gắn token cho axios
      }
    } catch (e) {
      console.error("Failed to parse saved user", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // helper: lưu token + user
  const persistAuth = (data, fallbackUser) => {
    const token = data?.token;
    const userData = data?.user || fallbackUser || null;

    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);        // 👈 rất quan trọng
    } else {
      localStorage.removeItem("token");
      setAuthToken(null);
    }

    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    setUser(userData);
    return userData;
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      return persistAuth(data, { email });
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      return persistAuth(data, { name, email });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setAuthToken(null);         
    setUser(null);
  };

  const loginWithToken = async (token) => {
    if (!token) return;

    localStorage.setItem("token", token);
    setAuthToken(token);

    try {
      const me = await api.get("/api/auth/me");
      setUser(me.data);
      localStorage.setItem("user", JSON.stringify(me.data));
    } catch (err) {
      console.error("loginWithToken /me error", err);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  // cho AccountPage dùng để sync user mới sau khi updateProfile
  const updateUser = (nextUser) => {
    setUser(nextUser);
    try {
      localStorage.setItem("user", JSON.stringify(nextUser));
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthCtx.Provider
      value={{ user, loading, login, register, logout, updateUser,loginWithToken, }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      updateUser: () => {},
      loginWithToken: async () => {}, 
    };
  }
  return ctx;
}
