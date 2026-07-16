"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, ArrowRight, BadgeCheck, Camera, Check, CheckCircle2, Clock3, ExternalLink, LockKeyhole, MapPin, PackageCheck, QrCode, ShieldCheck, ThermometerSnowflake, Truck } from "lucide-react";
import { useDemo } from "./demo-provider";
import { AMARA_LISTING, DEMO_HASHES, MARKETPLACE_LISTINGS } from "@/lib/demo-data";

const statusSteps = [
  { id: "escrowed", label: "Funds secured", icon: LockKeyhole },
  { id: "in_transit", label: "In transit", icon: Truck },
  { id: "settled", label: "Farmer paid", icon: CheckCircle2 },
];

const statusRank = { open: 0, escrowed: 1, in_transit: 2, breached: 2, settled: 3 };

export function OrderExperience() {
  const { state, settleOrder } = useDemo();
  const [verifying, setVerifying] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const listing = [AMARA_LISTING, ...MARKETPLACE_LISTINGS].find((item) => item.id === state.selectedListingId) ?? AMARA_LISTING;
  const subtotal = listing.weightKg * listing.pricePerKg;
  const discounted = state.status === "breached";
  const payout = Math.round(subtotal * (discounted ? .85 : 1));

  const verify = () => {
    setVerifying(true);
    window.setTimeout(() => {
      settleOrder(discounted);
      setVerifying(false);
      setShowQr(false);
    }, 1400);
  };

  if (state.status === "open") {
    return (
      <div className="panel grid min-h-[520px] place-items-center overflow-hidden p-8 text-center"><div><span className="mx-auto grid size-20 place-items-center rounded-[1.6rem] bg-leaf-100 text-forest-700"><LockKeyhole className="size-8" /></span><p className="eyebrow mt-7">No active escrow</p><h2 className="mt-3 text-4xl font-black tracking-[-.06em] text-forest-950">Choose a verified crate first.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-600">Buyer locks funds from the marketplace before the delivery and settlement views become active.</p><Link href="/marketplace" className="primary-button mt-7">Browse marketplace <ArrowRight className="size-4" /></Link></div></div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="panel overflow-hidden p-5 md:p-7">
          <div className="flex flex-col gap-5 border-b border-forest-950/8 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Order YG-ORD-008 · Chef Rosa</p><h2 className="mt-2 text-3xl font-black tracking-[-.05em] text-forest-950">{listing.produce} from {listing.farmer}</h2><p className="mt-2 flex items-center gap-1 text-[10px] text-ink-600"><MapPin className="size-3" />{listing.location} → Jakarta Selatan</p></div><span className={`pill w-fit ${state.status === "breached" ? "bg-clay-100 text-clay-500" : state.status === "settled" ? "bg-leaf-100 text-forest-700" : "bg-forest-950 text-white"}`}>{state.status === "breached" ? <AlertTriangle className="size-3" /> : state.status === "settled" ? <Check className="size-3" /> : <Clock3 className="size-3" />}{state.status.replace("_", " ")}</span></div>
          <div className="mt-6 grid grid-cols-3 gap-2">{statusSteps.map((step, index) => { const active = statusRank[state.status] >= index + 1; const Icon = step.icon; return <div key={step.id} className={`relative rounded-xl p-3 ${active ? "bg-leaf-100 text-forest-700" : "bg-cream-50 text-ink-600"}`}><Icon className="size-4" /><p className="mt-3 text-[8px] font-black uppercase tracking-wider">{step.label}</p>{index < 2 && <ArrowRight className="absolute -right-2.5 top-1/2 z-10 size-3.5 -translate-y-1/2 text-ink-600/35" />}</div>; })}</div>

          <div className="mt-6 grid gap-4 sm:grid-cols-[140px_1fr]"><div className="relative h-36 overflow-hidden rounded-2xl"><Image src={listing.image} alt={listing.produce} fill className="object-cover" /></div><div className="grid grid-cols-2 gap-2">{[["Weight", `${listing.weightKg} kg`], ["Grade A", `${listing.grade.A}%`], ["Shelf life", listing.shelfLife], ["Direct total", `Rp${subtotal.toLocaleString("id-ID")}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-cream-50 p-3"><p className="text-[8px] uppercase tracking-wider text-ink-600">{label}</p><p className="mt-2 text-xs font-black text-forest-950">{value}</p></div>)}</div></div>
        </div>

        <aside className="grid-field rounded-[1.5rem] p-5 text-white md:p-6"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-leaf-400 text-forest-950"><ShieldCheck className="size-5" /></span><span className="pill bg-white/7 text-white/50">Stellar testnet · demo</span></div><p className="eyebrow mt-10 !text-leaf-400">Escrow receipt</p><h3 className="mt-2 text-2xl font-black tracking-tight">Funds secured.</h3><p className="mt-3 text-[10px] leading-5 text-white/45">Released only when Chef Rosa verifies delivery. Users never handle a wallet or gas.</p><div className="mt-7 rounded-xl border border-white/9 bg-white/6 p-3"><p className="text-[8px] uppercase tracking-wider text-white/35">Transaction hash · demo</p><p className="mt-2 break-all font-mono text-[8px] leading-4 text-leaf-400">{DEMO_HASHES.escrow}</p></div><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/8 text-[9px] font-black text-white">Open testnet explorer <ExternalLink className="size-3.5" /></a></aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <div className="panel relative min-h-[520px] overflow-hidden bg-forest-950 p-2">
          <div className="map-frame h-[520px] overflow-hidden rounded-[1.1rem] bg-cream-100"><iframe src="https://www.google.com/maps?q=-6.972,107.630&z=10&output=embed" className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Simulated order transit map" /></div>
          <span className="absolute left-5 top-5 pill bg-clay-500 text-white"><Truck className="size-3" /> SIMULATED TRANSIT · IoT sensors on roadmap</span>
          <div className="absolute inset-x-5 bottom-5 grid grid-cols-3 gap-2"><div className="rounded-xl bg-white/92 p-3 backdrop-blur"><MapPin className="size-3.5 text-forest-700" /><p className="mt-2 text-[8px] text-ink-600">Current point</p><p className="mt-1 text-[10px] font-black">Bandung corridor</p></div><div className="rounded-xl bg-white/92 p-3 backdrop-blur"><Truck className="size-3.5 text-forest-700" /><p className="mt-2 text-[8px] text-ink-600">Vehicle</p><p className="mt-1 text-[10px] font-black">GD-14 · simulated</p></div><div className="rounded-xl bg-white/92 p-3 backdrop-blur"><Clock3 className="size-3.5 text-forest-700" /><p className="mt-2 text-[8px] text-ink-600">ETA</p><p className="mt-1 text-[10px] font-black">42 min · simulated</p></div></div>
        </div>

        <div className={`rounded-[1.5rem] border p-5 md:p-6 ${state.status === "breached" ? "border-clay-500/25 bg-clay-100" : "border-forest-950/9 bg-white"}`}>
          <div className="flex items-start justify-between"><div><p className="eyebrow">Cold-chain strip · simulated</p><h3 className="mt-2 text-xl font-black">{state.status === "breached" ? "Temperature breach." : "Transit looks stable."}</h3></div><span className={`grid size-10 place-items-center rounded-xl ${state.status === "breached" ? "bg-clay-500 text-white" : "bg-leaf-100 text-forest-700"}`}><ThermometerSnowflake className="size-4" /></span></div>
          <div className="mt-8 flex h-32 items-end gap-1 rounded-2xl bg-cream-50 p-4">{[32, 36, 34, 40, 38, 42, 46, 45, 52, 48, 55, state.status === "breached" ? 94 : 52, state.status === "breached" ? 100 : 48, state.status === "breached" ? 88 : 43].map((height, index) => <motion.i key={index} initial={{ height: 0 }} animate={{ height: `${height}%` }} transition={{ delay: index * .025 }} className={`flex-1 rounded-t ${state.status === "breached" && index > 10 ? "bg-clay-500" : "bg-forest-700"}`} />)}</div>
          <div className="mt-2 flex justify-between font-mono text-[8px] uppercase text-ink-600"><span>Pangalengan</span><span>{state.status === "breached" ? "9.2°C · breach" : "4.6°C · simulated"}</span><span>Jakarta</span></div>

          {state.status === "escrowed" && <div className="mt-6 rounded-xl bg-cream-100 p-4"><p className="text-[9px] font-black">Waiting for demo operator</p><p className="mt-1 text-[9px] leading-4 text-ink-600">Start transit from the hidden demo console.</p><Link href="/demo" className="mt-3 inline-flex items-center gap-2 text-[9px] font-black text-forest-700">Open console <ArrowRight className="size-3.5" /></Link></div>}

          {(state.status === "in_transit" || state.status === "breached") && <div className="mt-6"><div className={`rounded-xl p-4 ${state.status === "breached" ? "bg-white/65" : "bg-leaf-100"}`}><p className="text-[9px] font-black">{state.status === "breached" ? "Parametric discount ready" : "Delivery checkpoint ready"}</p><p className="mt-1 text-[9px] leading-4 text-ink-600">{state.status === "breached" ? `15% buyer refund · farmer payout Rp${payout.toLocaleString("id-ID")}` : "Scan the crate QR or use the manual fallback."}</p></div><div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => setShowQr(true)} className="soft-button min-h-12"><QrCode className="size-4" /> Scan QR</button><button onClick={verify} disabled={verifying} className="primary-button min-h-12"><PackageCheck className="size-4" />{verifying ? "Settling..." : state.status === "breached" ? "Accept discount" : "Verify delivery"}</button></div><p className="mt-3 text-center text-[8px] text-ink-600">Manual fallback is intentional and demo-safe.</p></div>}

          {state.status === "settled" && <div className="mt-6 rounded-2xl bg-leaf-100 p-5"><span className="grid size-10 place-items-center rounded-xl bg-forest-950 text-leaf-400"><Check className="size-5" /></span><p className="eyebrow mt-5">Settlement complete</p><p className="mt-2 text-3xl font-black tracking-[-.05em] text-forest-950">Farmer paid.</p><p className="mt-2 text-[9px] text-ink-600">Frontend demo payout · receipt details prepared.</p><Link href="/verification" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-950 text-[9px] font-black text-white">View receipt <ArrowRight className="size-3.5" /></Link></div>}
        </div>
      </section>

      <AnimatePresence>{showQr && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] grid place-items-center bg-forest-950/60 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-[1.7rem] bg-white p-5 text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-forest-950 text-leaf-400"><Camera className="size-7" /></span><h3 className="mt-5 text-xl font-black">Scan delivery QR</h3><p className="mt-2 text-[9px] leading-4 text-ink-600">Camera path is represented in this frontend prototype. Use the reliable manual fallback below.</p><label className="soft-button mt-5 w-full"><Camera className="size-4" /> Open camera<input type="file" accept="image/*" capture="environment" className="sr-only" /></label><button onClick={verify} className="primary-button mt-2 min-h-12 w-full"><BadgeCheck className="size-4" /> Manual verify delivery</button><button onClick={() => setShowQr(false)} className="mt-2 min-h-11 w-full text-[9px] font-bold text-ink-600">Cancel</button></div></motion.div>}</AnimatePresence>
    </div>
  );
}
