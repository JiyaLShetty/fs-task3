import { createContext, useState, useEffect, useContext } from "react";
import api, { setApiToken } from "../api/axios";

const AuthContext = createContext({});

const decode = (token) =>
  JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await api.post("/auth/refresh");
        setApiToken(data.accessToken);
        setUser(decode(data.accessToken));
      } catch {
        setApiToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = (token, userData) => {
    setApiToken(token);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    setApiToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
