"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Camera, Check, ChevronRight, CircleDollarSign, Clock3, History, ImagePlus, Leaf, Minus, PackageCheck, Plus, ScanLine, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
import { api } from "@/lib/api";
import type { GradingResult, Listing, ProduceType } from "@/lib/types";
import { useAuth } from "./auth-provider";
import { useDemo } from "./demo-provider";
import { ProfilePanel } from "./profile-panel";

type Tab = "scan" | "listings" | "wallet" | "profile";
type ScanView = "capture" | "grading" | "result";

const tabs = [
  { id: "scan" as const, label: "Scan", icon: ScanLine },
  { id: "listings" as const, label: "Listings", icon: Leaf },
  { id: "wallet" as const, label: "Payout", icon: WalletCards },
  { id: "profile" as const, label: "Profile", icon: UserRound },
];

const listingStatus = { open: "Open for buyers", escrowed: "Funds secured", in_transit: "In transit · simulated", breached: "Temperature breach", settled: "Paid" };

export function FarmerPwa() {
  const { session, ready } = useAuth();
  const { state, setScanInput, completeScan, listForSale } = useDemo();
  const [tab, setTab] = useState<Tab>("scan");
  const [scanView, setScanView] = useState<ScanView>("capture");
  const [produceType, setProduceType] = useState<ProduceType>(state.produceType);
  const [crateCount, setCrateCount] = useState(state.crateCount);
  const [price, setPrice] = useState(state.pricePerKg);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [grading, setGrading] = useState<GradingResult | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [gradingSource, setGradingSource] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [listedToast, setListedToast] = useState(false);
  const [payoutToast, setPayoutToast] = useState(false);
  const previousPayout = useRef(state.payoutVersion);

  useEffect(() => {
    if (state.payoutVersion <= previousPayout.current) return;
    setPayoutToast(true);
    navigator.vibrate?.([180, 80, 220]);
    previousPayout.current = state.payoutVersion;
    const timer = window.setTimeout(() => setPayoutToast(false), 5000);
    return () => window.clearTimeout(timer);
  }, [state.payoutVersion]);

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const scan = async () => {
    if (!photoFile) {
      setError("Take or choose a crate photo first");
      return;
    }
    setError(null);
    setScanInput(produceType, crateCount);
    setScanView("grading");
    try {
      const response = await api.scan(photoFile, crateCount, produceType);
      setGrading(response.result);
      setGradingSource(response.source);
      setPrice(response.result.suggested_unit_price);
      completeScan();
      setScanView("result");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Grading failed");
      setScanView("capture");
    }
  };

  const list = async () => {
    if (!grading) return;
    setError(null);
    try {
      const created = await api.createListing(grading.scan_id, price);
      setListing(created);
      listForSale(price, created.id);
      setListedToast(true);
      window.setTimeout(() => { setListedToast(false); setTab("listings"); }, 1200);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Listing failed");
    }
  };

  if (ready && (!session || session.user.role !== "SELLER")) {
    return <div className="panel grid min-h-96 place-items-center p-8 text-center"><div><Camera className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-2xl font-black">Sign in as a farmer.</h2><p className="mt-3 text-sm text-ink-600">The scan, listing, cryptographic signature, and payout feed are tied to a farmer account.</p><Link href="/auth" className="primary-button mt-6">Open account screen</Link></div></div>;
  }

  const result = grading;
  const gradeA = Math.round((result?.grade_distribution.A ?? 0) * 100);
  const gradeB = Math.round((result?.grade_distribution.B ?? 0) * 100);
  const reject = Math.round((result?.grade_distribution.reject ?? 0) * 100);
  const payout = Math.round(state.totalAmount * (1 - state.discountBps / 10_000));

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_470px] xl:items-start">
      <div className="order-2 xl:order-1 xl:sticky xl:top-28">
        <span className="pill bg-leaf-100 text-forest-700"><Leaf className="size-3" /> {session?.user.fullName} · Farmer PWA</span>
        <h2 className="mt-6 max-w-3xl text-[clamp(3rem,7vw,7.2rem)] font-black leading-[.85] tracking-[-.08em] text-forest-950">One hand.<br />One clear action.</h2>
        <p className="mt-6 max-w-xl text-sm leading-7 text-ink-600">Photo a crate, inspect the Codex-based visual grade, set a direct price, and receive the live settlement event after buyer verification.</p>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">{[[Camera, "Server", "grading path"], [ShieldCheck, "Codex", "visual rubric"], [CircleDollarSign, "Live", "settlement event"]].map(([Icon, value, label]) => { const ItemIcon = Icon as typeof Camera; return <div key={String(label)} className="panel p-4"><ItemIcon className="size-4 text-forest-700" /><p className="mt-5 text-xl font-black">{String(value)}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-ink-600">{String(label)}</p></div>; })}</div>
        <div className="mt-8 max-w-2xl rounded-2xl border border-forest-700/15 bg-leaf-100 p-4 text-[10px] leading-5 text-forest-700"><strong>Integrated path:</strong> this surface writes scans and listings to Spring/Postgres. Rehearsal grading is explicitly labeled when a live VLM is unavailable.</div>
      </div>

      <div className="order-1 mx-auto w-full max-w-[440px] xl:order-2">
        <div className="overflow-hidden rounded-[2.2rem] border-[7px] border-forest-950 bg-cream-50 shadow-[0_32px_90px_rgba(12,36,25,.22)]">
          <div className="flex min-h-14 items-center justify-between bg-forest-950 px-5 text-white"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-leaf-400">YieldGrid Farmer</p><p className="mt-0.5 text-[8px] text-white/42">{session?.user.walletReady ? "Stellar wallet ready" : "Wallet not provisioned"}</p></div><span className="pill bg-white/7 text-white/60"><i className="size-1.5 rounded-full bg-leaf-400" /> API live</span></div>
          <div className="relative min-h-[650px] bg-cream-50 pb-20">
            <AnimatePresence mode="wait">
              {tab === "scan" && <motion.div key={`scan-${scanView}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-4">
                {scanView === "capture" && <><div className="flex items-end justify-between"><div><p className="eyebrow">New harvest</p><h3 className="mt-2 text-2xl font-black">Scan a crate.</h3></div><span className="font-mono text-[8px] text-ink-600">STEP 1/2</span></div><label className="relative mt-5 block h-[285px] cursor-pointer overflow-hidden rounded-[1.5rem] border border-forest-950/10 bg-forest-950">{preview ? <Image src={preview} alt="Crate preview" fill unoptimized className="object-cover" /> : <div className="grid h-full place-items-center text-white/45"><Camera className="size-10" /></div>}<div className="absolute inset-0 bg-gradient-to-t from-forest-950/82 via-transparent to-transparent" /><input type="file" accept="image/*" capture="environment" onChange={(event) => onPhoto(event.target.files?.[0])} className="sr-only" /><span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-white/92 px-3 py-2 text-[9px] font-extrabold text-forest-950"><ImagePlus className="size-3.5" />{preview ? "Change photo" : "Use camera / gallery"}</span></label><div className="mt-4 grid grid-cols-2 gap-2">{(["tomato", "banana"] as ProduceType[]).map((produce) => <button key={produce} onClick={() => setProduceType(produce)} className={`min-h-12 rounded-xl border px-3 text-left text-[10px] font-black ${produceType === produce ? "border-forest-700 bg-leaf-100" : "border-forest-950/9 bg-white"}`}>{produce === "tomato" ? "Tomato · CXS 293" : "Banana · CXS 205"}</button>)}</div><div className="mt-3 flex min-h-14 items-center justify-between rounded-xl border border-forest-950/9 bg-white px-3"><div><p className="text-[9px] font-extrabold">Crate count</p><p className="text-[8px] text-ink-600">Farmer input · 15 kg each</p></div><div className="flex items-center gap-3"><button onClick={() => setCrateCount((value) => Math.max(1, value - 1))} className="grid size-10 place-items-center rounded-xl bg-cream-100"><Minus className="size-4" /></button><strong>{crateCount}</strong><button onClick={() => setCrateCount((value) => Math.min(20, value + 1))} className="grid size-10 place-items-center rounded-xl bg-forest-950 text-white"><Plus className="size-4" /></button></div></div>{error && <p className="mt-3 rounded-xl bg-clay-100 p-3 text-[9px] font-bold text-clay-500">{error}</p>}<button onClick={scan} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-400 text-xs font-black text-forest-950"><ScanLine className="size-4" /> Scan {crateCount} crates</button></>}
                {scanView === "grading" && <div className="grid min-h-[575px] place-items-center text-center"><div><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} className="mx-auto grid size-20 place-items-center rounded-full border border-dashed border-forest-700 bg-leaf-100"><Sparkles className="size-7 text-forest-700" /></motion.span><p className="eyebrow mt-7">Server grading</p><h3 className="mt-2 text-2xl font-black">Applying visual rubric...</h3><p className="mt-3 text-[10px] text-ink-600">The photo and farmer-entered crate count are being submitted to the backend.</p></div></div>}
                {scanView === "result" && result && <><div className="relative h-48 overflow-hidden rounded-[1.4rem]"><Image src={result.photo_url} alt="Graded crate" fill unoptimized className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" /><span className="pill absolute left-3 top-3 bg-leaf-400 text-forest-950"><BadgeCheck className="size-3" /> Grade ready</span><div className="absolute bottom-4 left-4 text-white"><p className="text-2xl font-black">{result.produce_type} · {result.est_weight_kg} kg</p><p className="mt-1 text-[8px] uppercase text-white/55">{result.crate_count} crates · visual estimate</p></div></div><div className="mt-3 rounded-[1.4rem] bg-forest-950 p-4 text-white"><div className="flex items-start justify-between"><div><p className="eyebrow !text-leaf-400">Grade distribution</p><h3 className="mt-2 text-3xl font-black">{gradeA}% A</h3></div><span className="pill bg-white/8 text-leaf-400"><Clock3 className="size-3" /> ~{result.est_shelf_life.approx_days} days</span></div><div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10"><i className="bg-leaf-400" style={{ width: `${gradeA}%` }} /><i className="bg-[#e6bb68]" style={{ width: `${gradeB}%` }} /><i className="bg-clay-500" style={{ width: `${reject}%` }} /></div><div className="mt-2 flex justify-between font-mono text-[7px] uppercase text-white/40"><span>A {gradeA}%</span><span>B {gradeB}%</span><span>Reject {reject}%</span></div><p className="mt-4 border-t border-white/8 pt-3 text-[8px] text-white/42">{result.rubric_version} · visual subset only</p></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-3"><p className="text-[8px] uppercase text-ink-600">Observed</p><p className="mt-2 text-[9px] font-bold">{result.defects_observed.join(" · ")}</p></div><div className="rounded-xl bg-white p-3"><p className="text-[8px] uppercase text-ink-600">Shelf-life basis</p><p className="mt-2 text-[9px] font-bold">{result.est_shelf_life.basis}</p></div></div><label className="mt-3 flex items-center justify-between rounded-xl bg-white p-3"><span><strong className="block text-[9px]">Unit price</strong><small className="text-[8px] text-ink-600">Editable before listing</small></span><span className="text-xs font-black">Rp<input value={price} onChange={(event) => setPrice(Number(event.target.value))} type="number" className="w-24 rounded-lg bg-cream-100 px-2 py-2 text-right" /></span></label><div className="mt-3 rounded-xl bg-leaf-100 p-3 text-[8px] font-black text-forest-700">{gradingSource === "rehearsal-cache" ? "REHEARSAL GRADING CACHE · disclosed fallback" : "LIVE VLM RESULT"} · {result.signature ? "Stellar signature ready" : "signature pending wallet provisioning"}</div>{error && <p className="mt-3 rounded-xl bg-clay-100 p-3 text-[9px] font-bold text-clay-500">{error}</p>}<button onClick={list} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-400 text-xs font-black text-forest-950"><PackageCheck className="size-4" /> List for sale</button></>}
              </motion.div>}
              {tab === "listings" && <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><p className="eyebrow">My listings</p><h3 className="mt-2 text-2xl font-black">Today&apos;s harvest.</h3>{listing ? <div className="mt-5 overflow-hidden rounded-[1.4rem] bg-white"><Image src={listing.photo_url} alt="Listing" width={700} height={400} unoptimized className="h-44 w-full object-cover" /><div className="p-4"><div className="flex justify-between"><div><p className="text-sm font-black">{listing.produce_type} · {listing.est_weight_kg} kg</p><p className="mt-1 font-mono text-[8px] text-ink-600">{listing.id}</p></div><span className="pill bg-cream-100 text-ink-600">{listingStatus[state.status]}</span></div><Link href="/order" className="mt-4 flex min-h-11 items-center justify-between rounded-xl bg-forest-950 px-3 text-[9px] font-black text-white">Follow order <ChevronRight className="size-4" /></Link></div></div> : <div className="mt-8 rounded-2xl border border-dashed p-8 text-center"><Leaf className="mx-auto size-7 text-ink-600/35" /><p className="mt-4 text-xs font-bold">No live listing yet</p></div>}</motion.div>}
              {tab === "wallet" && <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><div className="grid-field rounded-[1.5rem] p-5 text-white"><p className="eyebrow !text-white/40">Latest confirmed payout</p><p className="mt-3 text-4xl font-black">Rp{state.status === "settled" ? payout.toLocaleString("id-ID") : "0"}</p><p className="mt-12 text-[9px] text-white/42">Derived from the order settlement event; chain balance remains in the sidecar health path.</p></div><div className="mt-4 rounded-2xl bg-white p-4"><div className="flex gap-3"><History className="size-5 text-forest-700" /><div><p className="text-[10px] font-black">{state.status === "settled" ? "Payout confirmed" : "Waiting for verified delivery"}</p><p className="mt-1 text-[8px] text-ink-600">{state.settleTxHash || "No settlement transaction yet"}</p></div></div></div></motion.div>}
              {tab === "profile" && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><ProfilePanel compact /></motion.div>}
            </AnimatePresence>
            <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-forest-950/8 bg-white/95 p-2">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-bold ${tab === id ? "bg-leaf-100 text-forest-700" : "text-ink-600"}`}><Icon className="size-4" />{label}</button>)}</nav>
          </div>
        </div>
      </div>
      <AnimatePresence>{listedToast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-5 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-3 rounded-2xl bg-forest-950 p-4 text-white"><Check className="size-5 text-leaf-400" /><div><p className="text-xs font-black">Listing is live.</p><p className="text-[9px] text-white/45">Buyer dashboard received listing.created</p></div></motion.div>}</AnimatePresence>
      <AnimatePresence>{payoutToast && <motion.div initial={{ opacity: 0, scale: .9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="fixed inset-x-4 top-24 z-[80] mx-auto max-w-md rounded-[1.7rem] bg-leaf-400 p-5 text-forest-950 shadow-2xl"><p className="text-[9px] font-black uppercase">Payout received</p><p className="mt-1 text-3xl font-black">+Rp{payout.toLocaleString("id-ID")}</p><p className="mt-2 text-[9px]">Delivery verified · on-chain settlement event received</p></motion.div>}</AnimatePresence>
    </div>
  );
}
