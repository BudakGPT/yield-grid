"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, CheckCircle2, Clock3, ExternalLink, LockKeyhole, MapPin, PackageCheck, ShieldCheck, ThermometerSnowflake, Truck } from "lucide-react";
import { useDemo } from "./demo-provider";

const statusSteps = [
  { id: "escrowed", label: "Funds secured", icon: LockKeyhole },
  { id: "in_transit", label: "In transit", icon: Truck },
  { id: "settled", label: "Farmer paid", icon: CheckCircle2 },
];
const statusRank = { open: 0, escrowed: 1, in_transit: 2, breached: 2, settled: 3 };

export function OrderExperience() {
  const { state, settleOrder } = useDemo();
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listing = state.activeListing;
  const subtotal = state.totalAmount || (listing ? listing.weightKg * listing.pricePerKg : 0);
  const discounted = state.status === "breached";
  const payout = Math.round(subtotal * (1 - state.discountBps / 10_000));

  const verify = async () => {
    setVerifying(true);
    setError(null);
    try {
      await settleOrder();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Settlement failed");
    } finally {
      setVerifying(false);
    }
  };

  if (state.status === "open") {
    return <div className="panel grid min-h-[520px] place-items-center p-8 text-center"><div><LockKeyhole className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-3xl font-black">Choose a verified crate first.</h2><p className="mt-3 text-sm text-ink-600">The order view activates only after the sidecar confirms the buyer-funded escrow transaction.</p><Link href="/marketplace" className="primary-button mt-6">Browse marketplace <ArrowRight className="size-4" /></Link></div></div>;
  }

  if (!listing) {
    return <div className="panel grid min-h-[420px] place-items-center p-8 text-center"><div><Clock3 className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-2xl font-black">Order event received.</h2><p className="mt-3 text-sm text-ink-600">Open this order on the buyer device that created it to view listing details. No placeholder trade data is shown.</p></div></div>;
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 xl:grid-cols-[1fr_340px]">
        <div className="panel overflow-hidden p-5 md:p-7">
          <div className="flex flex-col gap-5 border-b border-forest-950/8 pb-6 sm:flex-row sm:items-start sm:justify-between"><div><p className="eyebrow">Order {state.orderId}</p><h2 className="mt-2 text-3xl font-black">{listing.produce} from {listing.farmer}</h2><p className="mt-2 flex items-center gap-1 text-[10px] text-ink-600"><MapPin className="size-3" />{listing.location} → Jakarta Selatan</p></div><span className={`pill w-fit ${state.status === "breached" ? "bg-clay-100 text-clay-500" : state.status === "settled" ? "bg-leaf-100 text-forest-700" : "bg-forest-950 text-white"}`}>{state.status === "breached" ? <AlertTriangle className="size-3" /> : <Clock3 className="size-3" />}{state.status.replace("_", " ")}</span></div>
          <div className="mt-6 grid grid-cols-3 gap-2">{statusSteps.map((step, index) => { const active = statusRank[state.status] >= index + 1; const Icon = step.icon; return <div key={step.id} className={`rounded-xl p-3 ${active ? "bg-leaf-100 text-forest-700" : "bg-cream-50 text-ink-600"}`}><Icon className="size-4" /><p className="mt-3 text-[8px] font-black uppercase">{step.label}</p></div>; })}</div>
          <div className="mt-6 grid gap-4 sm:grid-cols-[140px_1fr]"><div className="relative h-36 overflow-hidden rounded-2xl"><Image src={listing.image} alt={listing.produce} fill unoptimized className="object-cover" /></div><div className="grid grid-cols-2 gap-2">{[["Weight", `${listing.weightKg} kg`], ["Grade A", `${listing.grade.A}%`], ["Shelf life", listing.shelfLife], ["Direct total", `Rp${subtotal.toLocaleString("id-ID")}`]].map(([label, value]) => <div key={label} className="rounded-xl bg-cream-50 p-3"><p className="text-[8px] uppercase text-ink-600">{label}</p><p className="mt-2 text-xs font-black">{value}</p></div>)}</div></div>
        </div>
        <aside className="grid-field rounded-[1.5rem] p-5 text-white"><span className="grid size-11 place-items-center rounded-xl bg-leaf-400 text-forest-950"><ShieldCheck className="size-5" /></span><p className="eyebrow mt-10 !text-leaf-400">Escrow receipt</p><h3 className="mt-2 text-2xl font-black">Funds secured.</h3><p className="mt-3 text-[10px] leading-5 text-white/45">The buyer authorized this lock. The automated admin can only settle to the recorded farmer and buyer.</p><div className="mt-7 rounded-xl border border-white/9 bg-white/6 p-3"><p className="text-[8px] uppercase text-white/35">Confirmed transaction hash</p><p className="mt-2 break-all font-mono text-[8px] text-leaf-400">{state.escrowTxHash || "Confirmation pending"}</p></div><a href={state.escrowTxHash ? `https://stellar.expert/explorer/testnet/tx/${state.escrowTxHash}` : "https://stellar.expert/explorer/testnet"} target="_blank" rel="noreferrer" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white/8 text-[9px] font-black">Open testnet explorer <ExternalLink className="size-3.5" /></a></aside>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <div className="panel relative min-h-[520px] overflow-hidden bg-forest-950 p-2"><iframe src="https://www.google.com/maps?q=-6.972,107.630&z=10&output=embed" className="h-[520px] w-full rounded-[1.1rem] border-0" loading="lazy" title="Simulated order transit map" /><span className="absolute left-5 top-5 pill bg-clay-500 text-white"><Truck className="size-3" /> SIMULATED TRANSIT · IoT sensors on roadmap</span></div>
        <div className={`rounded-[1.5rem] border p-5 ${state.status === "breached" ? "border-clay-500/25 bg-clay-100" : "border-forest-950/9 bg-white"}`}>
          <div className="flex justify-between"><div><p className="eyebrow">Cold-chain strip · simulated</p><h3 className="mt-2 text-xl font-black">{state.status === "breached" ? "Temperature breach." : "Transit looks stable."}</h3></div><ThermometerSnowflake className="size-5 text-forest-700" /></div>
          <div className="mt-8 flex h-32 items-end gap-1 rounded-2xl bg-cream-50 p-4">{[32, 36, 40, 38, 46, 52, 48, 55, state.status === "breached" ? 100 : 48].map((height, index) => <i key={index} style={{ height: `${height}%` }} className={`flex-1 rounded-t ${state.status === "breached" && index > 6 ? "bg-clay-500" : "bg-forest-700"}`} />)}</div>
          <p className="mt-3 text-[9px] text-ink-600">Latest: {state.lastTemperatureC ?? 4.6}°C · SIMULATED</p>
          {(state.status === "in_transit" || state.status === "breached") && <div className="mt-6"><div className="rounded-xl bg-leaf-100 p-4"><p className="text-[9px] font-black">{discounted ? "Parametric discount ready" : "Delivery checkpoint ready"}</p><p className="mt-1 text-[9px] text-ink-600">{discounted ? `15% buyer refund · expected farmer payout Rp${payout.toLocaleString("id-ID")}` : "Use the manual verification fallback to trigger settlement."}</p></div>{error && <p className="mt-3 rounded-xl bg-clay-100 p-3 text-[9px] font-bold text-clay-500">{error}</p>}<button onClick={verify} disabled={verifying} className="primary-button mt-3 min-h-12 w-full"><PackageCheck className="size-4" />{verifying ? "Submitting settlement..." : discounted ? "Accept discount" : "Verify delivery"}</button></div>}
          {state.status === "escrowed" && <div className="mt-6 rounded-xl bg-cream-100 p-4"><p className="text-[9px] font-black">Waiting for operator</p><Link href="/demo" className="mt-3 inline-flex items-center gap-2 text-[9px] font-black text-forest-700">Open console <ArrowRight className="size-3.5" /></Link></div>}
          {state.status === "settled" && <div className="mt-6 rounded-2xl bg-leaf-100 p-5"><Check className="size-5 text-forest-700" /><p className="eyebrow mt-5">Settlement complete</p><p className="mt-2 text-3xl font-black">Farmer paid.</p><p className="mt-2 break-all text-[8px] text-ink-600">{state.settleTxHash}</p><Link href="/verification" className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-forest-950 text-[9px] font-black text-white">View receipt <ArrowRight className="size-3.5" /></Link></div>}
        </div>
      </section>
    </div>
  );
}
