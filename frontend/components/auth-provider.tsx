"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, readSession, writeSession } from "@/lib/api";
import type { AuthResponse, Profile, Role, UpdateProfileInput } from "@/lib/types";

type AuthContextValue = {
  session: AuthResponse | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, role: Role) => Promise<void>;
  updateProfile: (profile: UpdateProfileInput) => Promise<Profile>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;
      setSession(readSession());
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    session,
    ready,
    login: async (email, password) => {
      const next = await api.login(email, password);
      writeSession(next);
      setSession(next);
    },
    signup: async (fullName, email, password, role) => {
      const next = await api.signup(fullName, email, password, role);
      writeSession(next);
      setSession(next);
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
