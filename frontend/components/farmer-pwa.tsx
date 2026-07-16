"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, Check, ChevronRight, CircleDollarSign, Clock3, History, ImagePlus, Leaf, Minus, PackageCheck, Plus, ScanLine, ShieldCheck, Sparkles, UserRound, WalletCards } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useDemo } from "./demo-provider";
import type { ProduceType } from "@/lib/demo-data";

type Tab = "scan" | "listings" | "wallet" | "profile";
type ScanView = "capture" | "grading" | "result";

const tabs = [
  { id: "scan" as const, label: "Scan", icon: ScanLine },
  { id: "listings" as const, label: "Listings", icon: Leaf },
  { id: "wallet" as const, label: "Payout", icon: WalletCards },
  { id: "profile" as const, label: "Profile", icon: UserRound },
];

const listingStatus = {
  open: "Open for buyers",
  escrowed: "Funds secured",
  in_transit: "In transit · simulated",
  breached: "Temperature breach",
  settled: "Paid",
};

export function FarmerPwa() {
  const { state, setScanInput, completeScan, listForSale } = useDemo();
  const [tab, setTab] = useState<Tab>("scan");
  const [scanView, setScanView] = useState<ScanView>(state.scanComplete ? "result" : "capture");
  const [produceType, setProduceType] = useState<ProduceType>(state.produceType);
  const [crateCount, setCrateCount] = useState(state.crateCount);
  const [price, setPrice] = useState(state.pricePerKg);
  const [preview, setPreview] = useState<string | null>(null);
  const [listedToast, setListedToast] = useState(false);
  const [payoutToast, setPayoutToast] = useState(false);
  const previousPayout = useRef(state.payoutVersion);

  const weight = crateCount * 15;
  const cropLabel = produceType === "tomato" ? "Tomat" : "Pisang";

  useEffect(() => {
    if (state.payoutVersion > previousPayout.current) {
      setPayoutToast(true);
      navigator.vibrate?.([180, 80, 220]);
      const timer = window.setTimeout(() => setPayoutToast(false), 5000);
      previousPayout.current = state.payoutVersion;
      return () => window.clearTimeout(timer);
    }
  }, [state.payoutVersion]);

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
  };

  const scan = () => {
    setScanInput(produceType, crateCount);
    setScanView("grading");
    window.setTimeout(() => {
      completeScan();
      setScanView("result");
    }, 1700);
  };

  const list = () => {
    listForSale(price);
    setListedToast(true);
    window.setTimeout(() => {
      setListedToast(false);
      setTab("listings");
    }, 1400);
  };

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_470px] xl:items-start">
      <div className="order-2 xl:order-1 xl:sticky xl:top-28">
        <span className="pill bg-leaf-100 text-forest-700"><Leaf className="size-3" /> Amara · Farmer PWA</span>
        <h2 className="mt-6 max-w-3xl text-[clamp(3rem,7vw,7.2rem)] font-black leading-[.85] tracking-[-.08em] text-forest-950">One hand.<br />One clear action.</h2>
        <p className="mt-6 max-w-xl text-sm leading-7 text-ink-600">Prototype mobile-first untuk petani: foto peti, lihat penilaian visual Codex, tetapkan harga, lalu terima payout ketika buyer mengonfirmasi delivery.</p>
        <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
          {[[Camera, "≤6 sec", "grading target"], [ShieldCheck, "Codex", "visual rubric"], [CircleDollarSign, "Seconds", "delivery payout"]].map(([Icon, value, label]) => { const ItemIcon = Icon as typeof Camera; return <div key={String(label)} className="panel p-4"><ItemIcon className="size-4 text-forest-700" /><p className="mt-5 text-xl font-black">{String(value)}</p><p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-ink-600">{String(label)}</p></div>; })}
        </div>
        <div className="mt-8 max-w-2xl rounded-2xl border border-clay-500/15 bg-clay-100 p-4 text-[10px] leading-5 text-clay-500"><strong>Frontend demo:</strong> grading, IPFS, Stellar, dan payout di layar ini menggunakan data dummy. Bentuk interaksinya sudah mengikuti kontrak PRD v3.</div>
      </div>

      <div className="order-1 mx-auto w-full max-w-[440px] xl:order-2">
        <div className="overflow-hidden rounded-[2.2rem] border-[7px] border-forest-950 bg-cream-50 shadow-[0_32px_90px_rgba(12,36,25,.22)]">
          <div className="flex min-h-14 items-center justify-between bg-forest-950 px-5 text-white"><div><p className="text-[9px] font-black uppercase tracking-[.15em] text-leaf-400">YieldGrid Farmer</p><p className="mt-0.5 text-[8px] text-white/42">Pangalengan · Demo account</p></div><span className="pill bg-white/7 text-white/60"><i className="size-1.5 rounded-full bg-leaf-400" /> Online</span></div>

          <div className="relative min-h-[650px] bg-cream-50 pb-20">
            <AnimatePresence mode="wait">
              {tab === "scan" && (
                <motion.div key={`scan-${scanView}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="p-4">
                  {scanView === "capture" && <>
                    <div className="flex items-end justify-between"><div><p className="eyebrow">New harvest</p><h3 className="mt-2 text-2xl font-black tracking-[-.05em]">Scan a crate.</h3></div><span className="font-mono text-[8px] text-ink-600">STEP 1/2</span></div>
                    <label className="relative mt-5 block h-[285px] cursor-pointer overflow-hidden rounded-[1.5rem] border border-forest-950/10 bg-forest-950">
                      {preview ? <Image src={preview} alt="Preview hasil panen" fill unoptimized className="object-cover" /> : <div className="tomato-photo absolute inset-0" />}
                      <div className="absolute inset-0 bg-gradient-to-t from-forest-950/82 via-transparent to-transparent" />
                      <input type="file" accept="image/*" capture="environment" onChange={(event) => onPhoto(event.target.files?.[0])} className="sr-only" />
                      <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-xl bg-white/92 px-3 py-2 text-[9px] font-extrabold text-forest-950"><ImagePlus className="size-3.5" />{preview ? "Change photo" : "Use camera / gallery"}</span>
                      <span className="absolute right-4 top-4 pill bg-forest-950/70 text-leaf-400">Demo crate</span>
                    </label>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {(["tomato", "banana"] as ProduceType[]).map((produce) => <button key={produce} onClick={() => setProduceType(produce)} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 text-left transition ${produceType === produce ? "border-forest-700 bg-leaf-100" : "border-forest-950/9 bg-white"}`}><span className="text-lg">{produce === "tomato" ? "🍅" : "🍌"}</span><span><strong className="block text-[10px]">{produce === "tomato" ? "Tomato" : "Banana"}</strong><small className="text-[8px] text-ink-600">Codex rubric</small></span></button>)}
                    </div>

                    <div className="mt-3 flex min-h-14 items-center justify-between rounded-xl border border-forest-950/9 bg-white px-3"><div><p className="text-[9px] font-extrabold">Crate count</p><p className="mt-0.5 text-[8px] text-ink-600">Farmer input · 15 kg each</p></div><div className="flex items-center gap-3"><button onClick={() => setCrateCount((value) => Math.max(1, value - 1))} className="grid size-10 place-items-center rounded-xl bg-cream-100" aria-label="Kurangi peti"><Minus className="size-4" /></button><strong className="w-5 text-center text-lg">{crateCount}</strong><button onClick={() => setCrateCount((value) => Math.min(20, value + 1))} className="grid size-10 place-items-center rounded-xl bg-forest-950 text-white" aria-label="Tambah peti"><Plus className="size-4" /></button></div></div>
                    <button onClick={scan} className="mt-4 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-400 text-xs font-black text-forest-950 shadow-[0_12px_30px_rgba(155,195,61,.25)]"><ScanLine className="size-4" /> Scan {crateCount} crates</button>
                  </>}

                  {scanView === "grading" && <div className="grid min-h-[575px] place-items-center text-center"><div><motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }} className="mx-auto grid size-20 place-items-center rounded-full border border-dashed border-forest-700 bg-leaf-100"><Sparkles className="size-7 text-forest-700" /></motion.span><p className="eyebrow mt-7">Applying visual rubric</p><h3 className="mt-2 text-2xl font-black">Grading {cropLabel}...</h3><p className="mx-auto mt-3 max-w-xs text-[10px] leading-5 text-ink-600">Checking visible color, surface defects, decay, and ripeness stage.</p><div className="mx-auto mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-cream-200"><motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ repeat: Infinity, duration: 1.1 }} className="h-full w-1/2 bg-leaf-500" /></div></div></div>}

                  {scanView === "result" && <>
                    <div className="relative h-48 overflow-hidden rounded-[1.4rem]"><div className="tomato-photo absolute inset-0" /><div className="absolute inset-0 bg-gradient-to-t from-forest-950/70 to-transparent" /><span className="pill absolute left-3 top-3 bg-leaf-400 text-forest-950"><BadgeCheck className="size-3" /> Grade ready</span><div className="absolute bottom-4 left-4 text-white"><p className="text-2xl font-black">{cropLabel} · {weight} kg</p><p className="mt-1 text-[8px] uppercase tracking-wider text-white/55">{crateCount} crates · visual estimate</p></div></div>
                    <div className="mt-3 rounded-[1.4rem] bg-forest-950 p-4 text-white"><div className="flex items-start justify-between"><div><p className="eyebrow !text-leaf-400">Grade distribution</p><h3 className="mt-2 text-3xl font-black tracking-[-.06em]">70% A</h3></div><span className="pill bg-white/8 text-leaf-400"><Clock3 className="size-3" /> ~5–7 days</span></div><div className="mt-5 flex h-2 overflow-hidden rounded-full bg-white/10"><i className="w-[70%] bg-leaf-400" /><i className="w-[25%] bg-[#e6bb68]" /><i className="w-[5%] bg-clay-500" /></div><div className="mt-2 flex justify-between font-mono text-[7px] uppercase text-white/40"><span>A 70%</span><span>B 25%</span><span>Reject 5%</span></div><p className="mt-4 border-t border-white/8 pt-3 text-[8px] leading-4 text-white/42">A = Codex Extra / Class I · CXS 293. Visual subset only; firmness and internal defects are out of scope.</p></div>
                    <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-white p-3"><p className="text-[8px] uppercase tracking-wider text-ink-600">Observed</p><p className="mt-2 text-[9px] font-bold">Minor surface bruising · no visible decay</p></div><div className="rounded-xl bg-white p-3"><p className="text-[8px] uppercase tracking-wider text-ink-600">Shelf-life basis</p><p className="mt-2 text-[9px] font-bold">Visual ripeness · ambient storage</p></div></div>
                    <label className="mt-3 flex items-center justify-between rounded-xl border border-forest-950/9 bg-white p-3"><span><strong className="block text-[9px]">Suggested price</strong><small className="text-[8px] text-ink-600">Editable before listing</small></span><span className="flex items-center gap-1 text-xs font-black">Rp<input value={price} onChange={(event) => setPrice(Number(event.target.value))} type="number" className="w-20 rounded-lg bg-cream-100 px-2 py-2 text-right outline-none" /></span></label>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-leaf-100 px-3 py-2.5"><span className="flex items-center gap-2 text-[8px] font-black text-forest-700"><Check className="size-3.5" /> Proof anchored</span><span className="pill bg-white text-ink-600">Demo CID</span></div>
                    <button onClick={list} className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-leaf-400 text-xs font-black text-forest-950"><PackageCheck className="size-4" /> List for sale</button>
                    <button onClick={() => setScanView("capture")} className="mt-2 min-h-11 w-full text-[9px] font-bold text-ink-600">Scan again</button>
                  </>}
                </motion.div>
              )}

              {tab === "listings" && <motion.div key="listings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><p className="eyebrow">My listings</p><h3 className="mt-2 text-2xl font-black tracking-tight">Today’s harvest.</h3>{state.listingLive ? <div className="mt-5 overflow-hidden rounded-[1.4rem] border border-forest-950/9 bg-white"><div className="tomato-photo h-44" /><div className="p-4"><div className="flex items-start justify-between"><div><p className="text-sm font-black">Tomat merah · {state.crateCount * 15} kg</p><p className="mt-1 font-mono text-[8px] text-ink-600">YG-LST-1042</p></div><span className={`pill ${state.status === "settled" ? "bg-leaf-100 text-forest-700" : state.status === "breached" ? "bg-clay-100 text-clay-500" : "bg-cream-100 text-ink-600"}`}>{listingStatus[state.status]}</span></div><div className="mt-5 grid grid-cols-3 gap-2 text-center">{[["70%", "Grade A"], ["5–7d", "Shelf life"], [`Rp${state.pricePerKg.toLocaleString("id-ID")}`, "/kg"]].map(([value, label]) => <div key={label} className="rounded-xl bg-cream-50 p-3"><p className="text-xs font-black">{value}</p><p className="mt-1 text-[7px] uppercase text-ink-600">{label}</p></div>)}</div><Link href="/order" className="mt-4 flex min-h-11 items-center justify-between rounded-xl bg-forest-950 px-3 text-[9px] font-black text-white">Follow order <ChevronRight className="size-4" /></Link></div></div> : <div className="mt-8 rounded-2xl border border-dashed border-forest-950/15 p-8 text-center"><Leaf className="mx-auto size-7 text-ink-600/35" /><p className="mt-4 text-xs font-bold">No live listing yet</p><button onClick={() => { setTab("scan"); setScanView("capture"); }} className="soft-button mt-4">Scan first crate</button></div>}</motion.div>}

              {tab === "wallet" && <motion.div key="wallet" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><div className="grid-field rounded-[1.5rem] p-5 text-white"><div className="flex items-start justify-between"><div><p className="eyebrow !text-white/40">Testnet balance · demo</p><p className="mt-3 text-4xl font-black tracking-[-.06em]">Rp{state.status === "settled" ? "688.500" : "0"}</p></div><span className="grid size-11 place-items-center rounded-xl bg-white/8 text-leaf-400"><WalletCards className="size-5" /></span></div><p className="mt-12 text-[9px] text-white/42">Custodial UX · farmer never handles seed phrases or gas.</p></div><div className="mt-4"><div className="flex items-center justify-between"><div><p className="eyebrow">Settlement feed</p><h3 className="mt-2 text-lg font-black">Money movement</h3></div><History className="size-5 text-ink-600" /></div><div className="mt-4 rounded-2xl bg-white p-4"><div className="flex items-start gap-3"><span className={`grid size-10 place-items-center rounded-xl ${state.status === "settled" ? "bg-leaf-100 text-forest-700" : "bg-cream-100 text-ink-600"}`}>{state.status === "settled" ? <Check className="size-4" /> : <Clock3 className="size-4" />}</span><div className="flex-1"><p className="text-[10px] font-black">{state.status === "settled" ? "Payout received" : "Waiting for verified delivery"}</p><p className="mt-1 text-[8px] leading-4 text-ink-600">{state.status === "settled" ? "Order YG-ORD-008 · settlement demo" : "Escrow releases automatically after buyer confirmation."}</p></div>{state.status === "settled" && <strong className="text-[10px] text-forest-700">+Rp688.500</strong>}</div></div></div></motion.div>}

              {tab === "profile" && <motion.div key="profile" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4"><div className="rounded-[1.5rem] bg-white p-5 text-center"><span className="mx-auto grid size-20 place-items-center rounded-full bg-[#efd090] text-2xl font-black text-forest-950">AN</span><h3 className="mt-4 text-xl font-black">Amara Nwosu</h3><p className="mt-1 text-[9px] text-ink-600">Pangalengan · Tomatoes</p><span className="pill mt-4 bg-leaf-100 text-forest-700"><BadgeCheck className="size-3" /> 96 trust score</span></div><div className="mt-3 grid grid-cols-3 gap-2">{[["4.8t", "Settled"], ["97%", "On time"], ["94%", "Consistent"]].map(([value, label]) => <div key={label} className="rounded-xl bg-white p-3 text-center"><p className="text-sm font-black">{value}</p><p className="mt-1 text-[7px] uppercase tracking-wider text-ink-600">{label}</p></div>)}</div><div className="mt-3 rounded-2xl bg-leaf-100 p-4"><p className="text-[9px] font-black text-forest-700">Roadmap consequence</p><p className="mt-2 text-[9px] leading-4 text-forest-700/70">Accumulated verified trade history can later improve access to credit. It is not the product headline.</p></div></motion.div>}
            </AnimatePresence>

            <nav className="absolute inset-x-0 bottom-0 grid grid-cols-4 border-t border-forest-950/8 bg-white/95 p-2 backdrop-blur-xl">{tabs.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => setTab(id)} className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[8px] font-bold transition ${tab === id ? "bg-leaf-100 text-forest-700" : "text-ink-600"}`}><Icon className="size-4" />{label}</button>)}</nav>
          </div>
        </div>
      </div>

      <AnimatePresence>{listedToast && <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-5 left-1/2 z-[80] flex w-[min(92vw,430px)] -translate-x-1/2 items-center gap-3 rounded-2xl bg-forest-950 p-4 text-white shadow-2xl"><span className="grid size-11 place-items-center rounded-xl bg-leaf-400 text-forest-950"><Check className="size-5" /></span><div><p className="text-xs font-black">Listing is live.</p><p className="mt-1 text-[9px] text-white/45">Buyer dashboard updated · frontend demo</p></div></motion.div>}</AnimatePresence>
      <AnimatePresence>{payoutToast && <motion.div initial={{ opacity: 0, scale: .9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed inset-x-4 top-24 z-[80] mx-auto max-w-md overflow-hidden rounded-[1.7rem] bg-leaf-400 p-5 text-forest-950 shadow-[0_30px_90px_rgba(12,36,25,.35)]"><div className="flex items-start gap-4"><span className="grid size-12 place-items-center rounded-2xl bg-forest-950 text-leaf-400"><CircleDollarSign className="size-6" /></span><div><p className="text-[9px] font-black uppercase tracking-wider">Payout received</p><p className="mt-1 text-3xl font-black tracking-[-.05em]">+Rp688.500</p><p className="mt-2 text-[9px] text-forest-950/60">Delivery verified · settlement receipt ready</p></div></div></motion.div>}</AnimatePresence>
    </div>
  );
}
