"use client";

import Link from "next/link";
import { BadgeCheck, Check, ChevronDown, ExternalLink, FileKey2, Fingerprint, LockKeyhole, ReceiptText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useDemo } from "./demo-provider";
import { CopyProofButton } from "./copy-proof-button";
import { AMARA_LISTING, DEMO_HASHES, MARKETPLACE_LISTINGS } from "@/lib/demo-data";

export function SettlementReceipt() {
  const { state } = useDemo();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const listing = [AMARA_LISTING, ...MARKETPLACE_LISTINGS].find((item) => item.id === state.selectedListingId) ?? AMARA_LISTING;
  const amount = listing.weightKg * listing.pricePerKg;

  if (state.status !== "settled") {
    return <div className="panel grid min-h-[520px] place-items-center p-8 text-center"><div><span className="mx-auto grid size-20 place-items-center rounded-[1.6rem] bg-cream-100 text-ink-600"><ReceiptText className="size-8" /></span><p className="eyebrow mt-7">Receipt not issued</p><h2 className="mt-3 text-4xl font-black tracking-[-.06em]">Complete delivery first.</h2><p className="mx-auto mt-4 max-w-md text-sm leading-6 text-ink-600">The settlement receipt appears only after buyer verification releases escrow.</p><Link href="/order" className="primary-button mt-7">Back to active order</Link></div></div>;
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <section className="grid-field relative overflow-hidden rounded-[1.7rem] p-6 text-white md:p-9">
        <div className="absolute -right-32 -top-32 size-96 rounded-full border border-leaf-400/18" />
        <div className="absolute -right-10 -top-8 size-64 rounded-full border border-dashed border-white/12" />
        <div className="relative flex flex-wrap items-start justify-between gap-4"><span className="grid size-14 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Check className="size-7" /></span><span className="pill bg-white/7 text-white/55">Frontend demo receipt</span></div>
        <div className="relative mt-20"><p className="eyebrow !text-leaf-400">Settlement complete</p><h2 className="mt-3 text-[clamp(3rem,7vw,7rem)] font-black leading-[.82] tracking-[-.075em]">Farmer<br />paid.</h2><p className="mt-6 text-3xl font-black tracking-[-.05em] text-[#f4f5b5]">Rp{amount.toLocaleString("id-ID")}</p><p className="mt-2 text-[10px] text-white/45">{listing.farmer} · Order YG-ORD-008</p></div>
        <div className="relative mt-12 grid gap-2 sm:grid-cols-3">{[[LockKeyhole, "Escrow", "Released"], [BadgeCheck, "Delivery", "Verified"], [Fingerprint, "Receipt", "Prepared"]].map(([Icon, label, value]) => { const ItemIcon = Icon as typeof LockKeyhole; return <div key={String(label)} className="rounded-xl border border-white/9 bg-white/6 p-4"><ItemIcon className="size-4 text-leaf-400" /><p className="mt-4 text-[8px] uppercase tracking-wider text-white/35">{String(label)}</p><p className="mt-1 text-[10px] font-black">{String(value)}</p></div>; })}</div>
      </section>

      <aside className="space-y-4">
        <section className="panel p-5"><div className="flex items-start justify-between"><div><p className="eyebrow">Plain-language receipt</p><h2 className="mt-2 text-xl font-black">Trade is complete.</h2></div><ShieldCheck className="size-6 text-forest-700" /></div><div className="mt-6 space-y-3 text-[10px]">{[["Buyer", "Chef Rosa"], ["Farmer", listing.farmer], ["Produce", `${listing.produce} · ${listing.weightKg} kg`], ["Settlement", `Rp${amount.toLocaleString("id-ID")}`]].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 border-b border-forest-950/7 pb-3"><span className="text-ink-600">{label}</span><strong className="text-right text-forest-950">{value}</strong></div>)}</div></section>

        <section className="panel overflow-hidden"><button onClick={() => setDetailsOpen((value) => !value)} className="flex min-h-16 w-full items-center justify-between px-5 text-left"><span><span className="eyebrow">Progressive disclosure</span><strong className="mt-1 block text-xs">Technical proof details</strong></span><ChevronDown className={`size-4 transition ${detailsOpen ? "rotate-180" : ""}`} /></button>{detailsOpen && <div className="border-t border-forest-950/8 p-5"><div className="rounded-xl bg-forest-950 p-3 text-white"><p className="text-[8px] uppercase tracking-wider text-white/35">Settlement hash · demo</p><p className="mt-2 break-all font-mono text-[8px] leading-4 text-leaf-400">{DEMO_HASHES.settlement}</p><div className="mt-3"><CopyProofButton value={DEMO_HASHES.settlement} /></div></div><div className="mt-3 rounded-xl bg-cream-50 p-3"><p className="flex items-center gap-2 text-[9px] font-black"><FileKey2 className="size-3.5 text-forest-700" /> IPFS proof CID · demo</p><p className="mt-2 break-all font-mono text-[8px] text-ink-600">{DEMO_HASHES.ipfs}</p></div><div className="mt-3 grid grid-cols-2 gap-2"><a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="soft-button text-center">Stellar explorer <ExternalLink className="size-3" /></a><a href="https://ipfs.io" target="_blank" rel="noreferrer" className="soft-button text-center">IPFS gateway <ExternalLink className="size-3" /></a></div><p className="mt-3 text-[8px] leading-4 text-clay-500">These identifiers are placeholders in the frontend-only prototype and do not claim a completed on-chain transaction.</p></div>}</section>
      </aside>
    </div>
  );
}
