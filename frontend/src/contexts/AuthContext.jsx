import { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // { id, email, name, ... }
  const [loading, setLoading] = useState(true);

  // Nạp token từ localStorage khi app khởi động và hydrate /api/auth/me
  useEffect(() => {
    const saved = localStorage.getItem("token");
    if (saved) setAuthToken(saved);
    api.get("/api/auth/me")
      .then((r) => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/api/auth/login", { email, password });
    const token = res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token); // set Authorization header
    }
    const me = await api.get("/api/auth/me");
    setUser(me.data);
  };

  const register = async (payload) => {
    const res = await api.post("/api/auth/register", payload);
    const token = res.data?.token;
    if (token) {
      localStorage.setItem("token", token);
      setAuthToken(token);
    }
    const me = await api.get("/api/auth/me");
    setUser(me.data);
  };

  // Logout chỉ cần xóa token phía client (nếu BE chưa có /logout)
  const logout = async () => {
    // Nếu có endpoint BE: await api.post("/api/auth/logout");
    localStorage.removeItem("token");
    setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx) || { user: null, loading: false, login: () => {}, logout: () => {} };
}
