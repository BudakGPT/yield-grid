"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gauge, Home, Leaf, LogIn, LogOut, ScanLine, ShoppingBasket, Truck, UserRound } from "lucide-react";
import type { Role } from "@/lib/types";
import { useDemo } from "./demo-provider";
import { useAuth } from "./auth-provider";

const navigation: Array<{ href: string; label: string; icon: typeof Home; roles?: Role[] }> = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBasket, roles: ["BUYER", "SELLER", "ADMIN", "MODERATOR", "SUPPORT"] },
  { href: "/farmer", label: "Farmer workspace", icon: Leaf, roles: ["SELLER"] },
  { href: "/order", label: "Active order", icon: Truck, roles: ["BUYER", "SELLER"] },
  { href: "/admin", label: "Admin control", icon: Gauge, roles: ["ADMIN"] },
];

const orderStatusLabels = {
  open: "Open",
  escrowed: "Payment protected",
  in_transit: "In transit",
  breached: "Temperature issue",
  settled: "Paid",
};

export function SiteHeader() {
  const pathname = usePathname();
  const { state } = useDemo();
  const { session, logout } = useAuth();
  const visibleNavigation = navigation.filter((item) => !item.roles || (session && item.roles.includes(session.user.role)));
  const primaryAction = session?.user.role === "ADMIN"
    ? { href: "/admin", label: "Open control center", icon: Gauge }
    : session?.user.role === "SELLER"
      ? { href: "/farmer", label: "Scan crate", icon: ScanLine }
      : { href: "/marketplace", label: "Browse crates", icon: ShoppingBasket };
  const signOut = () => {
    logout();
    window.location.replace("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/7 bg-forest-950/96 text-white shadow-[0_16px_45px_rgba(12,36,25,.16)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1550px] items-center gap-3 px-4 sm:px-6 xl:px-8">
        <Link href="/" className="shrink-0" aria-label="YieldGrid home">
          <Image src="/yieldgrid-logo.png" alt="YieldGrid Harvest Intelligence" width={957} height={351} priority className="h-[52px] w-auto object-contain sm:h-[58px]" />
        </Link>

        <nav className="scrollbar-hide ml-2 hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex" aria-label="Main navigation">
          {visibleNavigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${active ? "bg-white text-forest-950 shadow-lg" : "text-white/58 hover:bg-white/8 hover:text-white"}`}>
                <Icon className="size-3.5" />
                <span>{label}</span>
                {href === "/order" && state.status !== "open" && <span className="rounded-md bg-leaf-400/15 px-1.5 py-0.5 text-[8px] text-leaf-400">{orderStatusLabels[state.status]}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? <div className="flex items-center gap-1"><Link href="/profile" aria-label="Open profile" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/8 px-3 text-[10px] font-extrabold text-white sm:px-4"><UserRound className="size-4" /><span className="hidden sm:inline">{session.user.fullName}</span></Link><button onClick={signOut} aria-label="Sign out" title="Sign out" className="grid size-10 place-items-center rounded-xl text-white/55 transition hover:bg-white/8 hover:text-white"><LogOut className="size-4" /></button></div> : <Link href="/auth" className="inline-flex h-10 items-center gap-2 rounded-xl bg-white/8 px-3 text-[10px] font-extrabold text-white sm:px-4"><LogIn className="size-4" /><span className="hidden sm:inline">Sign in</span></Link>}
          <Link href={primaryAction.href} className="inline-flex h-10 items-center gap-2 rounded-xl bg-leaf-400 px-3 text-[10px] font-extrabold text-forest-950 transition hover:-translate-y-0.5 hover:bg-[#c8e372] sm:px-4">
            <primaryAction.icon className="size-4" /><span className="hidden sm:inline">{primaryAction.label}</span>
          </Link>
        </div>
      </div>

      <nav className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-white/6 px-3 py-2 lg:hidden" aria-label="Mobile navigation">
        {visibleNavigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-bold ${pathname === href ? "bg-white text-forest-950" : "text-white/58"}`}>
            <Icon className="size-3.5" />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
