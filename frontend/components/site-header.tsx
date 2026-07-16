"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Boxes, HeartHandshake, Home, LayoutDashboard, Map, RadioTower, ScanLine, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ScanModal } from "./scan-modal";

const navigation = [
  { href: "/", label: "Beranda", icon: Home },
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/batches", label: "Harvest batches", icon: Boxes, badge: "18" },
  { href: "/rescue", label: "Rescue market", icon: HeartHandshake },
  { href: "/logistics", label: "Logistics", icon: Map },
  { href: "/verification", label: "Verification", icon: ShieldCheck },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scanOpen, setScanOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/7 bg-forest-950/96 text-white shadow-[0_16px_45px_rgba(12,36,25,.16)] backdrop-blur-xl">
        <div className="mx-auto flex min-h-[76px] max-w-[1550px] items-center gap-3 px-4 sm:px-6 xl:px-8">
          <Link href="/" className="shrink-0" aria-label="YieldGrid home">
            <Image src="/yieldgrid-logo.png" alt="YieldGrid — Harvest Intelligence" width={957} height={351} priority className="h-[52px] w-auto object-contain sm:h-[58px]" />
          </Link>

          <nav className="scrollbar-hide ml-2 hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-x-auto lg:flex" aria-label="Navigasi utama">
            {navigation.map(({ href, label, icon: Icon, badge }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href} className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-[11px] font-bold transition ${active ? "bg-white text-forest-950 shadow-lg" : "text-white/58 hover:bg-white/8 hover:text-white"}`}>
                  <Icon className="size-3.5" />
                  <span>{label}</span>
                  {badge && <span className="rounded-md bg-leaf-400/15 px-1.5 py-0.5 text-[8px] text-leaf-400">{badge}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/6 px-3 py-2 text-[9px] font-bold text-white/65 xl:flex">
              <RadioTower className="size-3.5 text-leaf-400" /> Network live
            </div>
            <button className="relative grid size-10 place-items-center rounded-xl border border-white/10 bg-white/6 text-white/65 transition hover:bg-white/10 hover:text-white" aria-label="Notifikasi">
              <Bell className="size-4" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-clay-500 ring-2 ring-forest-950" />
            </button>
            <button onClick={() => setScanOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-leaf-400 px-3 text-[10px] font-extrabold text-forest-950 transition hover:-translate-y-0.5 hover:bg-[#c8e372] sm:px-4">
              <ScanLine className="size-4" /><span className="hidden sm:inline">Scan harvest</span>
            </button>
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
      <ScanModal open={scanOpen} onClose={() => setScanOpen(false)} />
    </>
  );
}
