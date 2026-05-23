import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setForcedLogoutHandler } from "@/lib/apiClient";
import {
  clearSession,
  readSession,
  writeSession,
  type StoredSession,
} from "@/lib/storage";
import { authService } from "@/services/auth.service";
import type { AuthResponse, LoginRequest, Role } from "@/types/api";

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  companyId: string | null;
}

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupplier: boolean;
  isMerchant: boolean;
  login: (body: LoginRequest) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextValue | null>(null);

function toUser(session: StoredSession | AuthResponse): AuthUser {
  return {
    id: session.userId,
    fullName: session.fullName,
    email: session.email,
    role: session.role,
    companyId: session.companyId ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(() => {
    const session = readSession();
    return session ? toUser(session) : null;
  });

  const persist = useCallback((auth: AuthResponse): AuthUser => {
    writeSession({
      accessToken: auth.accessToken,
      refreshToken: auth.refreshToken,
      userId: auth.userId,
      fullName: auth.fullName,
      email: auth.email,
      role: auth.role,
      companyId: auth.companyId ?? null,
    });
    const u = toUser(auth);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(
    async (body: LoginRequest) => persist(await authService.login(body)),
    [persist],
  );

  const logout = useCallback(async () => {
    const session = readSession();
    if (session?.refreshToken) {
      // Best-effort server-side invalidation; ignore failures.
      await authService.logout({ refreshToken: session.refreshToken }).catch(() => undefined);
    }
    clearSession();
    setUser(null);
    queryClient.clear();
  }, [queryClient]);

  // React to a forced logout triggered by the api client (expired refresh token).
  useEffect(() => {
    setForcedLogoutHandler(() => {
      clearSession();
      setUser(null);
      queryClient.clear();
    });
    return () => setForcedLogoutHandler(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === "ADMIN",
      isSupplier: user?.role === "SUPPLIER",
      isMerchant: user?.role === "MERCHANT",
      login,
      logout,
    }),
    [user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
