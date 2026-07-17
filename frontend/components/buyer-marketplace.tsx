"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, BadgeCheck, Check, ChefHat, Clock3, Factory, Leaf, LockKeyhole, MapPin, RadioTower, ShieldCheck, ShoppingBasket, Star, Users, X } from "lucide-react";
import { api } from "@/lib/api";
import { toMarketplaceListing } from "@/lib/listing";
import { subscribeToYieldGrid } from "@/lib/ws";
import type { BuyerSegment, Listing, MarketplaceListing } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useDemo } from "./demo-provider";

const segments: Array<{ id: "all" | BuyerSegment; label: string; icon: typeof ShoppingBasket }> = [
  { id: "all", label: "All matches", icon: ShoppingBasket },
  { id: "retail", label: "Retail kitchen", icon: ChefHat },
  { id: "wholesale", label: "Wholesale", icon: Users },
  { id: "processing", label: "Processing", icon: Factory },
];

function ListingCard({ listing, onBuy, orderActive }: { listing: MarketplaceListing; onBuy: () => void; orderActive: boolean }) {
  return (
    <article className="panel group overflow-hidden p-2">
      <div className="relative h-60 overflow-hidden rounded-[1.15rem]">
        <Image src={listing.image} alt={listing.produce} fill unoptimized sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-950/82 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2"><span className="pill bg-leaf-400 text-forest-950"><RadioTower className="size-3" /> Live API</span><span className="pill bg-white/90 text-forest-950"><Clock3 className="size-3" /> {listing.shelfLife}</span></div>
        <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 text-white"><div><p className="font-mono text-[8px] uppercase tracking-wider text-white/55">{listing.id}</p><h3 className="mt-1 text-2xl font-black tracking-[-.04em]">{listing.produce}</h3><p className="mt-1 flex items-center gap-1 text-[9px] text-white/55"><MapPin className="size-3" />{listing.location}</p></div><span className="pill bg-forest-950/75 text-leaf-400"><Star className="size-3 fill-current" />{listing.reputation}</span></div>
      </div>
      <div className="p-3 pb-4">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[9px] text-ink-600">Farmer</p><p className="mt-1 text-xs font-black text-forest-950">{listing.farmer}</p></div><div className="text-right"><p className="text-xl font-black tracking-[-.04em] text-forest-950">Rp{listing.pricePerKg.toLocaleString("id-ID")}</p><p className="text-[8px] uppercase tracking-wider text-ink-600">per kg · {listing.weightKg} kg</p></div></div>
        <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-cream-200"><i className="bg-leaf-500" style={{ width: `${listing.grade.A}%` }} /><i className="bg-[#e6bb68]" style={{ width: `${listing.grade.B}%` }} /><i className="bg-clay-500" style={{ width: `${listing.grade.reject}%` }} /></div>
        <div className="mt-2 flex justify-between font-mono text-[8px] uppercase text-ink-600"><span>A {listing.grade.A}%</span><span>B {listing.grade.B}%</span><span>Reject {listing.grade.reject}%</span></div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-leaf-100 p-3"><BadgeCheck className="size-4 shrink-0 text-forest-700" /><p className="text-[8px] font-bold leading-4 text-forest-700">{listing.codex}<br /><span className="font-normal opacity-65">Visual criteria only</span></p></div>
        {orderActive ? <Link href="/order" className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-forest-950 text-[10px] font-black text-white">View secured order <ArrowRight className="size-3.5" /></Link> : <button onClick={onBuy} className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-leaf-400 text-[10px] font-black text-forest-950 transition hover:-translate-y-0.5"><ShoppingBasket className="size-3.5" /> Buy direct</button>}
      </div>
    </article>
  );
}

export function BuyerMarketplace() {
  const { state, lockEscrow } = useDemo();
  const { session, ready } = useAuth();
  const searchParams = useSearchParams();
  const initial = searchParams.get("segment") as BuyerSegment | null;
  const [segment, setSegment] = useState<"all" | BuyerSegment>(initial && ["retail", "wholesale", "processing"].includes(initial) ? initial : "all");
  const [allListings, setAllListings] = useState<MarketplaceListing[]>([]);
  const [selected, setSelected] = useState<MarketplaceListing | null>(null);
  const [locking, setLocking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!session || session.user.role !== "BUYER") return;
    api.getListings().then((items) => setAllListings(items.map(toMarketplaceListing))).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load listings"));
  }, [session]);

  useEffect(() => subscribeToYieldGrid((event) => {
    if (event.event !== "listing.created") return;
    const incoming = toMarketplaceListing(event.data as Listing);
    setAllListings((current) => [incoming, ...current.filter((item) => item.id !== incoming.id)]);
  }), []);

  const listings = useMemo(() => segment === "all" ? allListings : allListings.filter((listing) => listing.segment === segment), [allListings, segment]);

  const confirmEscrow = async () => {
    if (!selected) return;
    setLocking(true);
    setError(null);
    try {
      await lockEscrow(selected);
      setSelected(null);
      router.push("/order");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not lock escrow");
    } finally {
      setLocking(false);
    }
  };

  if (ready && (!session || session.user.role !== "BUYER")) {
    return <div className="panel grid min-h-80 place-items-center p-8 text-center"><div><LockKeyhole className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-2xl font-black">Sign in as a buyer.</h2><p className="mt-3 text-sm text-ink-600">A buyer wallet is required before funds can be locked in YGIDR escrow.</p><Link href="/auth" className="primary-button mt-6">Open account screen</Link></div></div>;
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-[270px_minmax(0,1fr)]">
        <aside className="panel h-fit p-3 xl:sticky xl:top-28">
          <div className="grid-field rounded-2xl p-5 text-white"><span className="grid size-10 place-items-center rounded-xl bg-leaf-400 text-forest-950"><ChefHat className="size-4" /></span><p className="eyebrow mt-7 !text-leaf-400">Signed-in buyer</p><h2 className="mt-2 text-xl font-black">{session?.user.fullName ?? "Loading"}</h2><p className="mt-2 text-[10px] leading-5 text-white/45">YGIDR wallet {session?.user.walletReady ? "ready" : "not provisioned"}</p></div>
          <div className="mt-3 space-y-1"><p className="eyebrow px-2 py-2">Demand segment</p>{segments.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setSegment(id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[10px] font-bold transition ${segment === id ? "bg-leaf-100 text-forest-700" : "text-ink-600 hover:bg-cream-50"}`}><Icon className="size-4" /><span className="flex-1">{label}</span>{segment === id && <Check className="size-3.5" />}</button>)}</div>
          <div className="mt-4 rounded-xl border border-forest-700/15 bg-leaf-100 p-3 text-[8px] leading-4 text-forest-700"><strong>Integrated feed.</strong> Cards come from Spring/Postgres and new listings arrive over WebSocket.</div>
        </aside>

        <section>
          <div className="flex flex-col gap-4 rounded-[1.5rem] bg-[#dfe79a] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div><span className="eyebrow">Live marketplace feed</span><h2 className="mt-2 text-2xl font-black tracking-[-.04em] text-forest-950">Verified before you buy.</h2><p className="mt-2 text-[10px] text-forest-950/55">Quality distribution, shelf-life band, Codex mapping, and direct farm price.</p></div><span className="pill w-fit bg-forest-950 text-white"><RadioTower className="size-3 text-leaf-400" /> {listings.length} live listing{listings.length === 1 ? "" : "s"}</span></div>
          {error && <p className="mt-4 rounded-xl bg-clay-100 p-3 text-[10px] font-bold text-clay-500">{error}</p>}
          <div className="mt-4 grid gap-4 md:grid-cols-2 2xl:grid-cols-3">{listings.map((listing) => <ListingCard key={listing.id} listing={listing} onBuy={() => setSelected(listing)} orderActive={listing.id === state.selectedListingId && state.status !== "open"} />)}</div>
          {listings.length === 0 && <div className="panel mt-4 grid min-h-72 place-items-center text-center"><div><Leaf className="mx-auto size-8 text-ink-600/30" /><h3 className="mt-4 text-lg font-black">No open match yet.</h3><p className="mt-2 text-[10px] text-ink-600">A farmer listing will appear here live without refresh.</p></div></div>}
        </section>
      </div>

      <AnimatePresence>{selected && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)} className="fixed inset-0 z-[80] grid place-items-end bg-forest-950/55 p-3 backdrop-blur-sm sm:place-items-center"><motion.div initial={{ y: 30, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} className="w-full max-w-lg overflow-hidden rounded-[1.8rem] bg-white shadow-2xl"><div className="flex items-start justify-between bg-forest-950 p-5 text-white"><div><p className="eyebrow !text-leaf-400">Direct order</p><h2 className="mt-2 text-2xl font-black">Buy from {selected.farmer}</h2><p className="mt-1 text-[9px] text-white/42">No quality-and-trust broker markup</p></div><button onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-xl bg-white/8" aria-label="Close"><X className="size-4" /></button></div><div className="p-5"><div className="flex items-center gap-3 rounded-2xl bg-cream-50 p-3"><div className="relative size-16 overflow-hidden rounded-xl"><Image src={selected.image} alt="" fill unoptimized className="object-cover" /></div><div className="min-w-0 flex-1"><p className="text-xs font-black">{selected.produce} · {selected.weightKg} kg</p><p className="mt-1 text-[9px] text-ink-600">{selected.grade.A}% A · {selected.shelfLife}</p></div><strong className="text-sm">Rp{(selected.weightKg * selected.pricePerKg).toLocaleString("id-ID")}</strong></div><div className="mt-4 space-y-2">{[[ShieldCheck, "Quality visible", selected.codex], [LockKeyhole, "Funds secured", "Submitted to Stellar testnet escrow"], [Leaf, "Farmer receives", "Released after delivery verification"]].map(([Icon, title, copy]) => { const ItemIcon = Icon as typeof ShieldCheck; return <div key={String(title)} className="flex gap-3 rounded-xl border border-forest-950/8 p-3"><ItemIcon className="mt-0.5 size-4 shrink-0 text-forest-700" /><div><p className="text-[9px] font-black">{String(title)}</p><p className="mt-1 text-[8px] text-ink-600">{String(copy)}</p></div></div>; })}</div><button onClick={confirmEscrow} disabled={locking} className="mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-400 text-[10px] font-black text-forest-950 disabled:opacity-70">{locking ? "Submitting Stellar escrow..." : <><LockKeyhole className="size-4" />Accept & lock escrow</>}</button><p className="mt-3 text-center text-[8px] text-ink-600">This action fails visibly if the sidecar or testnet is unavailable.</p></div></motion.div></motion.div>}</AnimatePresence>
    </>
  );
}
