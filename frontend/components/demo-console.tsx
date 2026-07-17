"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, PackageOpen, Play, RefreshCcw, Siren, SlidersHorizontal } from "lucide-react";
import { useDemo } from "./demo-provider";

export function DemoConsole() {
  const { state, startTransit, injectBreach, settleOrder, resetDemo } = useDemo();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (name: string, action: () => Promise<void>) => {
    setBusy(name);
    setError(null);
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `${name} failed`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <section className="grid-field overflow-hidden rounded-[1.6rem] p-5 text-white md:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="pill bg-clay-500 text-white"><SlidersHorizontal className="size-3" /> DELIVERY PREVIEW</span><h2 className="mt-5 text-3xl font-black md:text-4xl">Order walkthrough controls</h2><p className="mt-3 max-w-xl text-[11px] leading-5 text-white/45">Use these controls to preview the order experience from purchase through farmer payment.</p></div><span className="pill bg-white/7 text-white/60">{state.lastEvent}</span></div>
        <div className="mt-8 grid gap-2 sm:grid-cols-5">{[["01", "Ready", state.status === "open"], ["02", "Payment protected", state.status === "escrowed"], ["03", "In transit", state.status === "in_transit"], ["04", "Temperature issue", state.status === "breached"], ["05", "Farmer paid", state.status === "settled"]].map(([no, label, active]) => <div key={String(no)} className={`rounded-xl border p-3 ${active ? "border-leaf-400 bg-leaf-400 text-forest-950" : "border-white/9 bg-white/5 text-white/42"}`}><p className="font-mono text-[8px]">{String(no)}</p><p className="mt-3 text-[9px] font-black uppercase">{String(label)}</p></div>)}</div>
      </section>

      <section className="panel p-5 md:p-6">
        <p className="eyebrow">Preview controls</p><h2 className="mt-2 text-xl font-black">Move the active order forward.</h2>
        {error && <p className="mt-4 rounded-xl bg-clay-100 p-3 text-[10px] font-bold text-clay-500">{error}</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button onClick={() => run("transit", startTransit)} disabled={state.status !== "escrowed" || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-cream-50 p-4 text-left disabled:opacity-45"><Play className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Start delivery</strong><small className="text-[8px] text-ink-600">Show the route preview</small></span></button>
          <button onClick={() => run("temperature", injectBreach)} disabled={!(["escrowed", "in_transit"].includes(state.status)) || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-clay-500/20 bg-clay-100 p-4 text-left disabled:opacity-45"><Siren className="size-5 text-clay-500" /><span><strong className="block text-[10px]">Add temperature issue</strong><small className="text-[8px] text-ink-600">Preview the buyer discount</small></span></button>
          <button onClick={() => run("payment", settleOrder)} disabled={!(["in_transit", "breached"].includes(state.status)) || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-leaf-100 p-4 text-left disabled:opacity-45"><Check className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Verify delivery</strong><small className="text-[8px] text-ink-600">Complete the farmer payment</small></span></button>
          <button onClick={() => run("reset", resetDemo)} disabled={busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-white p-4 text-left disabled:opacity-45"><RefreshCcw className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Reset walkthrough</strong><small className="text-[8px] text-ink-600">Start again from an empty order</small></span></button>
        </div>
        {!state.orderId && <div className="mt-4 rounded-xl bg-cream-100 p-4 text-[9px] text-ink-600"><PackageOpen className="mr-2 inline size-4" />No active order. Create a farmer listing and purchase it from the marketplace. <Link href="/marketplace" className="ml-2 font-black text-forest-700">Open market <ArrowRight className="inline size-3" /></Link></div>}
      </section>
    </div>
  );
}
