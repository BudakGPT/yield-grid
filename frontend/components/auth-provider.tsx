"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, readSession, writeSession } from "@/lib/api";
import type { AuthResponse, Role } from "@/lib/types";

type AuthContextValue = {
  session: AuthResponse | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthResponse | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSession(readSession());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
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
