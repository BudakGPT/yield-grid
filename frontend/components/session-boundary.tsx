"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { Role } from "@/lib/types";
import { useAuth } from "./auth-provider";

const ALL_ROLES: Role[] = ["BUYER", "SELLER", "ADMIN", "MODERATOR", "SUPPORT"];
const ROUTE_RULES: Array<{ path: string; roles: Role[] }> = [
  { path: "/admin", roles: ["ADMIN"] },
  { path: "/farmer", roles: ["SELLER"] },
  { path: "/marketplace", roles: ALL_ROLES },
  { path: "/order", roles: ALL_ROLES },
  { path: "/profile", roles: ALL_ROLES },
  { path: "/verification", roles: ALL_ROLES },
];

function routeRule(pathname: string) {
  return ROUTE_RULES.find(({ path }) => pathname === path || pathname.startsWith(`${path}/`));
}

function roleHome(role: Role) {
  if (role === "ADMIN") return "/admin";
  if (role === "SELLER") return "/farmer";
  return "/marketplace";
}

export function SessionBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { ready, session } = useAuth();
  const rule = routeRule(pathname);
  const forbidden = Boolean(ready && session && rule && !rule.roles.includes(session.user.role));

  useEffect(() => {
    if (!ready || !rule) return;
    if (!session) {
      window.location.replace(`/auth?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!rule.roles.includes(session.user.role)) window.location.replace(roleHome(session.user.role));
  }, [pathname, ready, rule, session]);

  if (rule && (!ready || !session || forbidden)) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream-50 px-6 text-center">
        <div>
          <div className="mx-auto size-8 animate-spin rounded-full border-2 border-forest-950/15 border-t-forest-700" />
          <p className="mt-4 text-xs font-bold text-ink-600">Checking account access...</p>
        </div>
      </div>
    );
  }

  return children;
}
