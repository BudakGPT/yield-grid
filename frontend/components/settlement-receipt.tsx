"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, Check, ChevronDown, ExternalLink, FileKey2, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";
import { CopyProofButton } from "./copy-proof-button";
import { useDemo } from "./demo-provider";

export function SettlementReceipt() {
  const { state } = useDemo();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const listing = state.activeListing;
  const amount = Math.round((state.totalAmount || (listing ? listing.weightKg * listing.pricePerKg : 0)) * (1 - state.discountBps / 10_000));

  if (state.status !== "settled") {
    return <div className="panel grid min-h-[520px] place-items-center p-8 text-center"><div><ReceiptText className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-3xl font-black">Complete delivery first.</h2><p className="mt-3 text-sm text-ink-600">The receipt appears only after the sidecar confirms the settlement transaction.</p><Link href="/order" className="primary-button mt-6">Back to active order</Link></div></div>;
  }

  if (!listing) {
    return <div className="panel grid min-h-[420px] place-items-center p-8 text-center"><div><ReceiptText className="mx-auto size-9 text-forest-700" /><h2 className="mt-5 text-2xl font-black">Settlement confirmed.</h2><p className="mt-3 break-all text-sm text-ink-600">{state.settleTxHash}</p><p className="mt-3 text-[10px] text-ink-600">Listing metadata belongs to the buyer device that created the order; no placeholder receipt is rendered.</p></div></div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
      <section className="grid-field rounded-[1.6rem] p-6 text-white md:p-8"><div className="flex justify-between"><span className="grid size-14 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Check className="size-7" /></span><span className="pill bg-white/7 text-white/55">Confirmed settlement</span></div><p className="eyebrow mt-12 !text-leaf-400">Farmer payout</p><h2 className="mt-3 text-5xl font-black">Rp{amount.toLocaleString("id-ID")}</h2><p className="mt-4 text-sm text-white/48">Buyer delivery verification triggered the automated admin release. {state.discountBps > 0 ? `${state.discountBps / 100}% was refunded to the buyer.` : "The farmer received the full escrow."}</p><div className="mt-10 grid grid-cols-3 gap-2">{[[LockKeyhole, "Escrow", "Released"], [BadgeCheck, "Delivery", "Verified"], [ShieldCheck, "Receipt", "On-chain"]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof LockKeyhole; return <div key={String(label)} className="rounded-xl border border-white/9 bg-white/6 p-4"><ItemIcon className="size-4 text-leaf-400" /><p className="mt-4 text-[8px] uppercase text-white/35">{String(label)}</p><p className="mt-1 text-[10px] font-black">{String(value)}</p></div>; })}</div></section>
      <div className="space-y-4">
        <section className="panel p-5"><p className="eyebrow">Plain-language receipt</p><h2 className="mt-2 text-xl font-black">Trade is complete.</h2><div className="mt-6 space-y-3 text-[10px]">{[["Buyer", "Chef Rosa"], ["Farmer", listing.farmer], ["Produce", `${listing.produce} · ${listing.weightKg} kg`], ["Settlement", `Rp${amount.toLocaleString("id-ID")}`]].map(([label, value]) => <div key={label} className="flex justify-between border-b border-forest-950/7 pb-3"><span className="text-ink-600">{label}</span><strong>{value}</strong></div>)}</div></section>
        <section className="panel overflow-hidden"><button onClick={() => setDetailsOpen((value) => !value)} className="flex min-h-16 w-full items-center justify-between px-5 text-left"><span><span className="eyebrow">Progressive disclosure</span><strong className="mt-1 block text-xs">Technical proof details</strong></span><ChevronDown className={`size-4 ${detailsOpen ? "rotate-180" : ""}`} /></button>{detailsOpen && <div className="border-t border-forest-950/8 p-5"><div className="rounded-xl bg-forest-950 p-3 text-white"><p className="text-[8px] uppercase text-white/35">Settlement hash</p><p className="mt-2 break-all font-mono text-[8px] text-leaf-400">{state.settleTxHash}</p><div className="mt-3"><CopyProofButton value={state.settleTxHash} /></div></div><div className="mt-3 rounded-xl bg-cream-50 p-3"><p className="flex items-center gap-2 text-[9px] font-black"><FileKey2 className="size-3.5 text-forest-700" /> IPFS grading proof</p><p className="mt-2 break-all font-mono text-[8px] text-ink-600">{listing.ipfsCid ?? "Pinata CID not available for this scan"}</p></div><div className="mt-3 grid grid-cols-2 gap-2"><a href={`https://stellar.expert/explorer/testnet/tx/${state.settleTxHash}`} target="_blank" rel="noreferrer" className="soft-button text-center">Stellar explorer <ExternalLink className="size-3" /></a>{listing.ipfsCid ? <a href={`https://ipfs.io/ipfs/${listing.ipfsCid}`} target="_blank" rel="noreferrer" className="soft-button text-center">IPFS gateway <ExternalLink className="size-3" /></a> : <span className="soft-button justify-center opacity-45">IPFS unavailable</span>}</div></div>}</section>
      </div>
    </div>
  );
}
