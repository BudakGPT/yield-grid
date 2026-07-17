"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, invalidateSession, readSession, SESSION_INVALIDATED_EVENT, SESSION_STORAGE_KEY, sessionExpiresAt, writeSession } from "@/lib/api";
import type { AuthResponse, Profile, Role, UpdateProfileInput } from "@/lib/types";

type AuthContextValue = {
  session: AuthResponse | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthResponse>;
  signup: (fullName: string, email: string, password: string, role: Role) => Promise<AuthResponse>;
  updateProfile: (profile: UpdateProfileInput) => Promise<Profile>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const syncSession = () => {
      if (!active) return;
      setSession(readSession());
      setReady(true);
    };
    const syncStoredSession = (event: StorageEvent) => {
      if (event.key === SESSION_STORAGE_KEY || event.key === null) syncSession();
    };
    queueMicrotask(syncSession);
    window.addEventListener("storage", syncStoredSession);
    window.addEventListener(SESSION_INVALIDATED_EVENT, syncSession);
    return () => {
      active = false;
      window.removeEventListener("storage", syncStoredSession);
      window.removeEventListener(SESSION_INVALIDATED_EVENT, syncSession);
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    const expiresAt = sessionExpiresAt(session);
    if (expiresAt === null) return;
    const remaining = expiresAt - Date.now() - 5_000;
    if (remaining <= 0) {
      invalidateSession();
      return;
    }
    const timer = window.setTimeout(invalidateSession, Math.min(remaining, 2_147_483_647));
    return () => window.clearTimeout(timer);
  }, [session]);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready,
    login: async (email, password) => {
      const next = await api.login(email, password);
      writeSession(next);
      setSession(next);
      return next;
    },
    signup: async (fullName, email, password, role) => {
      const next = await api.signup(fullName, email, password, role);
      writeSession(next);
      setSession(next);
      return next;
    },
    updateProfile: async (profile) => {
      const updated = await api.updateMyProfile(profile);
      setSession((current) => {
        if (!current) return current;
        const next = {
          ...current,
          user: {
            ...current.user,
            fullName: updated.fullName,
            enabled: updated.enabled,
            emailVerified: updated.emailVerified,
            stellarPublicKey: updated.stellarPublicKey,
            walletReady: updated.walletReady,
          },
        };
        writeSession(next);
        return next;
      });
      return updated;
    },
    logout: () => {
      writeSession(null);
      setSession(null);
    },
  }), [ready, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
