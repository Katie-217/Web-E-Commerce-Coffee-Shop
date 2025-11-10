import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);      // { userId, email, fullName } từ /auth/me
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/auth/me")
      .then(r => setUser(r.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    await api.post("/auth/login", { email, password });
    const { data } = await api.get("/auth/me");
    setUser(data);
  };

  const register = async (payload) => {
    await api.post("/auth/register", payload);
    const { data } = await api.get("/auth/me");
    setUser(data);
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx) || { user: null, loading: false };
}
