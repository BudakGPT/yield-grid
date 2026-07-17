"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, UserRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { OAUTH_ROLE_KEY } from "@/lib/oauth";
import { ApiError } from "@/lib/api";
import type { Role } from "@/lib/types";

type Phase = "working" | "needs-role" | "error";

export default function AuthCallbackPage() {
  const { oauthLogin } = useAuth();
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("working");
  const [message, setMessage] = useState("Finishing Google sign-in...");
  const token = useRef<string | null>(null);
  const started = useRef(false);

  const finish = useCallback(async (accessToken: string, role?: Role) => {
    const session = await oauthLogin(accessToken, role);
    router.replace(session.user.role === "SELLER" ? "/farmer" : "/marketplace");
  }, [oauthLogin, router]);

  const handleFailure = useCallback((reason: unknown) => {
    if (reason instanceof ApiError && reason.status === 428) {
      setPhase("needs-role");
      return;
    }
    setMessage(reason instanceof Error ? reason.message : "Google sign-in failed");
    setPhase("error");
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let active = true;

    const waitForToken = async (): Promise<string | null> => {
      const current = await supabase!.auth.getSession();
      if (current.data.session?.access_token) return current.data.session.access_token;
      // detectSessionInUrl exchanges the ?code param asynchronously; wait for the SIGNED_IN event.
      return new Promise((resolve) => {
        const { data } = supabase!.auth.onAuthStateChange((_event, session) => {
          if (session?.access_token) {
            data.subscription.unsubscribe();
            resolve(session.access_token);
          }
        });
        setTimeout(() => {
          data.subscription.unsubscribe();
          resolve(null);
        }, 6000);
      });
    };

    (async () => {
      if (!supabase) {
        setMessage("Google sign-in is not configured");
        setPhase("error");
        return;
      }
      const accessToken = await waitForToken();
      if (!active) return;
      if (!accessToken) {
        setMessage("Google sign-in did not complete. Please try again.");
        setPhase("error");
        return;
      }
      token.current = accessToken;
      const storedRole = (sessionStorage.getItem(OAUTH_ROLE_KEY) || "") as Role | "";
      try {
        await finish(accessToken, storedRole || undefined);
      } catch (reason) {
        if (active) handleFailure(reason);
      }
    })();

    return () => {
      active = false;
    };
  }, [finish, handleFailure]);

  const chooseRole = async (role: Role) => {
    if (!token.current) return;
    setPhase("working");
    setMessage("Creating your account...");
    try {
      await finish(token.current, role);
    } catch (reason) {
      handleFailure(reason);
    }
  };

  return (
    <main className="site-container grid min-h-[60vh] place-items-center py-16">
      <div className="panel w-full max-w-md p-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Leaf className="size-5" /></span>

        {phase === "working" && <>
          <h1 className="mt-6 text-2xl font-black">{message}</h1>
          <p className="mt-3 text-sm text-ink-600">Exchanging your Google session for a YieldGrid account.</p>
        </>}

        {phase === "needs-role" && <>
          <h1 className="mt-6 text-2xl font-black">One last step.</h1>
          <p className="mt-3 text-sm text-ink-600">How will you use YieldGrid?</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {(["SELLER", "BUYER"] as Role[]).map((value) => <button key={value} type="button" onClick={() => chooseRole(value)} className="min-h-16 rounded-xl border border-forest-950/10 text-sm font-black hover:border-forest-700 hover:bg-leaf-100 hover:text-forest-700"><UserRound className="mr-2 inline size-4" />{value === "SELLER" ? "Farmer" : "Buyer"}</button>)}
          </div>
        </>}

        {phase === "error" && <>
          <h1 className="mt-6 text-2xl font-black">Sign-in failed.</h1>
          <p className="mt-3 rounded-xl bg-clay-100 p-3 text-xs font-bold text-clay-500">{message}</p>
          <Link href="/auth" className="primary-button mt-6 inline-flex">Back to sign in</Link>
        </>}
      </div>
    </main>
  );
}
