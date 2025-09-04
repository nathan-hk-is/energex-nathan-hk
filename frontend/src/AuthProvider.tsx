// src/AuthProvider.tsx
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthCtx {
  userId?: number;
  name?: string;
  email?: string;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}
const AuthContext = createContext<AuthCtx>({
  userId: undefined,
  name: undefined,
  email: undefined,
  loading: false,
  refresh: async () => {},
  logout: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [userId, setUserId] = useState<number>();
  const [name, setName] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      // Always include credentials so the backend receives our auth cookie
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/me`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const { userId, name, email } = await res.json();
        setUserId(userId);
        setName(name);
        setEmail(email);
      } else {
        setUserId(undefined);
        setName(undefined);
        setEmail(undefined);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (userId !== undefined) {
      localStorage.removeItem(`userdata_${userId}`);
    }
    setUserId(undefined);
    setName(undefined);
    setEmail(undefined);
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider
      value={{ userId, name, email, loading, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
export const useAuth = () => useContext(AuthContext);
