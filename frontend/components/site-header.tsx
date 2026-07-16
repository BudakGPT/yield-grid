"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Home, Leaf, RadioTower, ScanLine, ShoppingBasket, Truck } from "lucide-react";
import { useDemo } from "./demo-provider";

const navigation = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/marketplace", label: "Buyer market", icon: ShoppingBasket },
  { href: "/farmer", label: "Farmer PWA", icon: Leaf },
  { href: "/order", label: "Active order", icon: Truck },
  { href: "/demo", label: "Demo console", icon: FlaskConical },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { state } = useDemo();

  return (
    <header className="sticky top-0 z-50 border-b border-white/7 bg-forest-950/96 text-white shadow-[0_16px_45px_rgba(12,36,25,.16)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1550px] items-center gap-3 px-4 sm:px-6 xl:px-8">
        <Link href="/" className="shrink-0" aria-label="YieldGrid home">
          <Image src="/yieldgrid-logo.png" alt="YieldGrid — Harvest Intelligence" width={957} height={351} priority className="h-[52px] w-auto object-contain sm:h-[58px]" />
        </Link>

        <nav className="scrollbar-hide ml-2 hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex" aria-label="Navigasi utama">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${active ? "bg-white text-forest-950 shadow-lg" : "text-white/58 hover:bg-white/8 hover:text-white"}`}>
                <Icon className="size-3.5" />
                <span>{label}</span>
                {href === "/order" && state.status !== "open" && <span className="rounded-md bg-leaf-400/15 px-1.5 py-0.5 text-[8px] text-leaf-400">{state.status.replace("_", " ")}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[9px] font-bold text-white/65 xl:flex">
            <RadioTower className="size-3.5 text-leaf-400" /> Frontend demo · dummy data
          </div>
          <Link href="/farmer" className="inline-flex h-10 items-center gap-2 rounded-xl bg-leaf-400 px-3 text-[10px] font-extrabold text-forest-950 transition hover:-translate-y-0.5 hover:bg-[#c8e372] sm:px-4">
            <ScanLine className="size-4" /><span className="hidden sm:inline">Scan crate</span>
          </Link>
        </div>
      </div>

      <nav className="scrollbar-hide flex gap-1 overflow-x-auto border-t border-white/6 px-3 py-2 lg:hidden" aria-label="Navigasi mobile">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-bold ${pathname === href ? "bg-white text-forest-950" : "text-white/58"}`}>
            <Icon className="size-3.5" />{label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
