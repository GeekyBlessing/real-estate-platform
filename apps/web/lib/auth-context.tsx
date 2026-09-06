"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { apiFetch, ApiError } from "./api-client";

export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  fullName: string;
  status: string;
  roles: string[];
}

export interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  password: string;
}

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  user: {
    id: string;
    email: string;
    phone: string | null;
    full_name: string;
    status: string;
    roles: string[];
  };
}

function toAuthUser(payload: TokenResponse["user"]): AuthUser {
  return {
    id: payload.id,
    email: payload.email,
    phone: payload.phone,
    fullName: payload.full_name,
    status: payload.status,
    roles: payload.roles,
  };
}

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True only while the very first silent refresh (session restore) on load is in flight, not on every login/register call. */
  isRestoringSession: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * The access token lives in memory only, in this React state, never
 * in localStorage or a readable cookie: per the architecture doc's
 * section 8, it's a short-lived JWT, and keeping it out of storage an
 * XSS payload could read is the whole point of that choice. A page
 * reload loses it, which is expected, not a bug; restoreSession()
 * below gets it back from the httpOnly refresh cookie, which
 * JavaScript can't read directly either but the backend can exchange
 * for a new access token.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isRestoringSession, setIsRestoringSession] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleRefresh = useCallback((expiresInSeconds: number) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Refresh at 90% of the access token's lifetime, quietly, well
    // before it actually expires, so a signed in visitor doesn't hit
    // a 401 mid-session just from the 15 minute window lapsing.
    refreshTimer.current = setTimeout(() => {
      void silentRefresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, expiresInSeconds * 0.9 * 1000);
  }, []);

  const applySession = useCallback(
    (data: TokenResponse) => {
      setAccessToken(data.access_token);
      setUser(toAuthUser(data.user));
      scheduleRefresh(data.expires_in_seconds);
    },
    [scheduleRefresh]
  );

  const clearSession = useCallback(() => {
    setAccessToken(null);
    setUser(null);
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
  }, []);

  const silentRefresh = useCallback(async () => {
    try {
      const data = await apiFetch<TokenResponse>("/auth/refresh", { method: "POST", sameOriginHeader: true });
      applySession(data);
    } catch {
      // No valid refresh cookie (never logged in, expired, or revoked
      // by reuse detection): this is the ordinary logged-out state,
      // not an error to surface to a visitor who never signed in.
      clearSession();
    }
  }, [applySession, clearSession]);

  useEffect(() => {
    silentRefresh().finally(() => setIsRestoringSession(false));
    return () => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const data = await apiFetch<TokenResponse>("/auth/login", { method: "POST", body: { email, password } });
      applySession(data);
    },
    [applySession]
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      const data = await apiFetch<TokenResponse>("/auth/register", {
        method: "POST",
        body: {
          full_name: input.fullName,
          email: input.email,
          phone: input.phone,
          role: input.role,
          password: input.password,
        },
      });
      applySession(data);
    },
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await apiFetch<void>("/auth/logout", { method: "POST", sameOriginHeader: true });
    } catch {
      // Best effort: the cookie may already be gone or expired. Clear local state regardless.
    }
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, isAuthenticated: user !== null, isRestoringSession, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { ApiError };
