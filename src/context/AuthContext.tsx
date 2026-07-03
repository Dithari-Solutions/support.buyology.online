"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  api,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from "@/lib/api";
import { AuthResponse, RoleName, User } from "@/lib/types";

const ROLE_RANK: Record<RoleName, number> = {
  USER: 1,
  SUPPORT_TEAM: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: RegisterData) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (...roles: RoleName[]) => boolean;
  isAtLeast: (role: RoleName) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      return;
    }
    try {
      const me = await api.get<User>("/api/account/me");
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await refreshUser();
      setLoading(false);
    })();
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const data = await api.post<AuthResponse>("/api/auth/login", { email, password }, false);
    setTokens(data.accessToken, data.refreshToken);
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    return api.post<User>("/api/auth/register", data, false);
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) {
        await api.post("/api/auth/logout", { refreshToken }, false);
      }
    } catch {
      // ignore — clear locally regardless
    }
    clearTokens();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: RoleName[]) => (user ? roles.includes(user.role) : false),
    [user]
  );

  const isAtLeast = useCallback(
    (role: RoleName) => (user ? ROLE_RANK[user.role] >= ROLE_RANK[role] : false),
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, hasRole, isAtLeast }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
