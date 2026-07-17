"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Leaf, UserRound } from "lucide-react";
import { useAuth } from "./auth-provider";
import type { Role } from "@/lib/types";

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [role, setRole] = useState<Role>("SELLER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") await signup(fullName, email, password, role);
      else await login(email, password);
      router.replace(mode === "login" ? "/" : role === "SELLER" ? "/farmer" : "/marketplace");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[.8fr_1.2fr]">
      <div className="grid-field rounded-[1.8rem] p-7 text-white">
        <span className="grid size-12 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Leaf className="size-5" /></span>
        <p className="eyebrow mt-12 !text-leaf-400">Welcome to YieldGrid</p>
        <h2 className="mt-3 text-4xl font-black tracking-[-.06em]">One account for direct trade.</h2>
        <p className="mt-5 text-sm leading-7 text-white/50">Farmers can grade and list harvests, while buyers can purchase directly and follow each delivery.</p>
      </div>
      <form onSubmit={submit} className="panel p-6 md:p-8">
        <div className="flex gap-2">{(["signup", "login"] as const).map((value) => <button key={value} type="button" aria-pressed={mode === value} onClick={() => { setMode(value); setError(null); }} className={`min-h-11 rounded-xl px-4 text-[10px] font-black ${mode === value ? "bg-forest-950 text-white" : "bg-cream-100 text-ink-600"}`}>{value === "signup" ? "Create account" : "Sign in"}</button>)}</div>
        {mode === "signup" && <div className="mt-6 grid grid-cols-2 gap-2">{(["SELLER", "BUYER"] as Role[]).map((value) => <button key={value} type="button" onClick={() => setRole(value)} className={`min-h-14 rounded-xl border text-[10px] font-black ${role === value ? "border-forest-700 bg-leaf-100 text-forest-700" : "border-forest-950/10"}`}><UserRound className="mr-2 inline size-4" />{value === "SELLER" ? "Farmer" : "Buyer"}</button>)}</div>}
        <div className="mt-6 space-y-3">
          {mode === "signup" && <label className="block text-[9px] font-black">Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required className="mt-2 min-h-12 w-full rounded-xl border border-forest-950/10 px-4 text-sm font-medium outline-none focus:border-forest-700" /></label>}
          <label className="block text-[9px] font-black">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required className="mt-2 min-h-12 w-full rounded-xl border border-forest-950/10 px-4 text-sm font-medium outline-none focus:border-forest-700" /></label>
          <label className="block text-[9px] font-black">Password<input type="password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === "signup" ? "new-password" : "current-password"} required className="mt-2 min-h-12 w-full rounded-xl border border-forest-950/10 px-4 text-sm font-medium outline-none focus:border-forest-700" /></label>
        </div>
        {error && <p role="alert" aria-live="polite" className="mt-4 rounded-xl bg-clay-100 p-3 text-[10px] font-bold text-clay-500">{error}</p>}
        <button type="submit" disabled={busy} className="primary-button mt-6 min-h-14 w-full"><KeyRound className="size-4" />{busy ? "Connecting..." : mode === "signup" ? "Create YieldGrid account" : "Sign in"}</button>
      </form>
    </div>
  );
}
