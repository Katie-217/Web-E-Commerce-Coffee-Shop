import React, { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);    // { id, name, email, ... }
  const [loading, setLoading] = useState(true);

  // Lấy user từ localStorage khi app load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        setUser(JSON.parse(saved));
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
    }
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
    }

    setUser(userData);
    return userData;
  };

  // gọi từ UI: login(email, password)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await authService.login({ email, password });
      return persistAuth(data, { email });
    } finally {
      setLoading(false);
    }
  };

  // gọi từ UI: register({ name, email, password })
  const register = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const data = await authService.register({ name, email, password });
      // nếu BE không trả user, dùng fallback name+email
      return persistAuth(data, { name, email });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();   // clear localStorage
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) {
    // fallback an toàn nếu quên bọc AuthProvider
    return {
      user: null,
      loading: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
    };
  }
  return ctx;
}
