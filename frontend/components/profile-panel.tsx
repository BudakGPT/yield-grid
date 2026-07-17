"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BadgeCheck, CircleAlert, LoaderCircle, LockKeyhole, MapPin, Save, ShieldCheck, UserRound, WalletCards } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import type { Profile } from "@/lib/types";
import { useAuth } from "./auth-provider";

type ProfileForm = {
  fullName: string;
  phoneNumber: string;
  location: string;
  bio: string;
  avatarUrl: string;
};

const emptyForm: ProfileForm = {
  fullName: "",
  phoneNumber: "",
  location: "",
  bio: "",
  avatarUrl: "",
};

function toForm(profile: Profile): ProfileForm {
  return {
    fullName: profile.fullName,
    phoneNumber: profile.phoneNumber ?? "",
    location: profile.location ?? "",
    bio: profile.bio ?? "",
    avatarUrl: profile.avatarUrl ?? "",
  };
}

export function ProfilePanel({ compact = false }: { compact?: boolean }) {
  const { session, ready, updateProfile } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const accessToken = session?.accessToken;

  useEffect(() => {
    if (!ready || !accessToken) return;

    let active = true;
    api.getMyProfile()
      .then((next) => {
        if (!active) return;
        setProfile(next);
        setForm(toForm(next));
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof ApiError ? cause.message : "Could not load your profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [ready, accessToken]);

  const initials = useMemo(() => (profile?.fullName ?? session?.user.fullName ?? "YG")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(), [profile?.fullName, session?.user.fullName]);

  function change(field: keyof ProfileForm, value: string) {
    setSaved(false);
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      setForm(toForm(updated));
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof ApiError ? cause.message : "Could not save your profile");
    } finally {
      setSaving(false);
    }
  }

  if (!ready || (accessToken && loading)) {
    return <div className="grid min-h-72 place-items-center rounded-[1.5rem] bg-white"><LoaderCircle className="size-6 animate-spin text-forest-700" /></div>;
  }

  if (!session) {
    return <div className="rounded-[1.5rem] bg-white p-8 text-center"><LockKeyhole className="mx-auto size-7 text-forest-700" /><h2 className="mt-4 text-xl font-black">Sign in to manage your profile.</h2><Link href="/auth" className="mt-5 inline-flex rounded-xl bg-forest-950 px-5 py-3 text-xs font-black text-white">Go to sign in</Link></div>;
  }

  return (
    <div className={`grid gap-4 ${compact ? "" : "lg:grid-cols-[.72fr_1.28fr]"}`}>
      <aside className="rounded-[1.5rem] bg-forest-950 p-5 text-white">
        <div className="flex items-center gap-4">
          <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[#efd090] text-xl font-black text-forest-950" style={profile?.avatarUrl ? { backgroundImage: `url(${profile.avatarUrl})`, backgroundPosition: "center", backgroundSize: "cover", color: "transparent" } : undefined}>{initials}</span>
          <div className="min-w-0"><p className="truncate text-lg font-black">{profile?.fullName ?? session.user.fullName}</p><p className="mt-1 text-[9px] uppercase tracking-[.16em] text-white/45">{session.user.role === "SELLER" ? "Farmer profile" : "Buyer profile"}</p></div>
        </div>
        <div className="mt-6 space-y-2 text-[9px]">
          <div className="flex items-center gap-2 rounded-xl bg-white/6 p-3"><BadgeCheck className="size-4 text-leaf-400" />{profile?.emailVerified ? "Email verified" : "Email confirmation pending"}</div>
          <div className="flex items-center gap-2 rounded-xl bg-white/6 p-3"><WalletCards className="size-4 text-leaf-400" />{profile?.walletReady ? "Payments ready" : "Payment setup pending"}</div>
          <div className="flex items-center gap-2 rounded-xl bg-white/6 p-3"><ShieldCheck className="size-4 text-leaf-400" />Email and account type cannot be changed here</div>
        </div>
      </aside>

      <form onSubmit={submit} className="rounded-[1.5rem] bg-white p-5">
        <div className="flex items-start justify-between gap-3"><div><p className="eyebrow">Account profile</p><h2 className="mt-2 text-xl font-black">Your YieldGrid profile.</h2></div><UserRound className="size-5 text-forest-700" /></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-[9px] font-bold text-ink-600">Full name<input required minLength={2} maxLength={100} value={form.fullName} onChange={(event) => change("fullName", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl bg-cream-100 px-3 text-[10px] text-forest-950 outline-none ring-leaf-400 focus:ring-2" /></label>
          <label className="text-[9px] font-bold text-ink-600">Phone number<input type="tel" maxLength={32} value={form.phoneNumber} onChange={(event) => change("phoneNumber", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl bg-cream-100 px-3 text-[10px] text-forest-950 outline-none ring-leaf-400 focus:ring-2" /></label>
          <label className="text-[9px] font-bold text-ink-600 sm:col-span-2">Location<span className="relative mt-2 block"><MapPin className="absolute left-3 top-3.5 size-3.5 text-ink-600/45" /><input maxLength={120} value={form.location} onChange={(event) => change("location", event.target.value)} className="min-h-11 w-full rounded-xl bg-cream-100 pl-9 pr-3 text-[10px] text-forest-950 outline-none ring-leaf-400 focus:ring-2" /></span></label>
          <label className="text-[9px] font-bold text-ink-600 sm:col-span-2">Bio<textarea maxLength={500} rows={4} value={form.bio} onChange={(event) => change("bio", event.target.value)} className="mt-2 w-full resize-none rounded-xl bg-cream-100 p-3 text-[10px] leading-5 text-forest-950 outline-none ring-leaf-400 focus:ring-2" /><span className="mt-1 block text-right font-mono text-[7px] text-ink-600/45">{form.bio.length}/500</span></label>
          <label className="text-[9px] font-bold text-ink-600 sm:col-span-2">Avatar URL<input type="url" maxLength={2048} value={form.avatarUrl} onChange={(event) => change("avatarUrl", event.target.value)} className="mt-2 min-h-11 w-full rounded-xl bg-cream-100 px-3 text-[10px] text-forest-950 outline-none ring-leaf-400 focus:ring-2" /></label>
          <label className="text-[9px] font-bold text-ink-600">Email<input readOnly value={profile?.email ?? session.user.email} className="mt-2 min-h-11 w-full cursor-not-allowed rounded-xl bg-forest-950/5 px-3 text-[10px] text-ink-600" /></label>
          <label className="text-[9px] font-bold text-ink-600">Role<input readOnly value={profile?.role ?? session.user.role} className="mt-2 min-h-11 w-full cursor-not-allowed rounded-xl bg-forest-950/5 px-3 text-[10px] text-ink-600" /></label>
        </div>
        {error && <p role="alert" className="mt-4 flex items-center gap-2 rounded-xl bg-clay-100 p-3 text-[9px] font-bold text-clay-500"><CircleAlert className="size-4" />{error}</p>}
        {saved && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-100 p-3 text-[9px] font-bold text-forest-700"><BadgeCheck className="size-4" />Profile saved.</p>}
        <button disabled={saving} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-leaf-400 text-[10px] font-black text-forest-950 disabled:cursor-wait disabled:opacity-65"><Save className="size-4" />{saving ? "Saving profile..." : "Save profile"}</button>
      </form>
    </div>
  );
}
