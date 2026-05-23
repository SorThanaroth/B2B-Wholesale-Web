/**
 * Persisted auth session. Tokens live in localStorage so a refresh survives
 * page reloads; the AuthContext is the only writer besides the token-refresh
 * interceptor. Keep this module dependency-free so `apiClient` can import it
 * without creating a cycle.
 */
import type { Role } from "@/types/api";

const KEY = "b2b.auth";

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  fullName: string;
  email: string;
  role: Role;
  /** Set only for SUPPLIER accounts. */
  companyId?: string | null;
}

export function readSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession): void {
  localStorage.setItem(KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(KEY);
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}

export function getRefreshToken(): string | null {
  return readSession()?.refreshToken ?? null;
}

/** Update only the token pair (used after a silent refresh). */
export function updateTokens(accessToken: string, refreshToken: string): void {
  const current = readSession();
  if (!current) return;
  writeSession({ ...current, accessToken, refreshToken });
}
