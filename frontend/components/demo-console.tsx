"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, ArrowRight, Check, CircleDot, Gauge, LockKeyhole, PackageOpen, Play, RadioTower, RefreshCcw, Siren, SlidersHorizontal, TerminalSquare } from "lucide-react";
import { useDemo } from "./demo-provider";
import { READINESS_SERVICES } from "@/lib/demo-data";

export function DemoConsole() {
  const { state, listForSale, lockEscrow, startTransit, injectBreach, settleOrder, resetDemo } = useDemo();
  const [speed, setSpeed] = useState(55);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const seed = () => {
    listForSale(18000);
    lockEscrow();
  };

  const reset = () => {
    setResetting(true);
    setResetDone(false);
    window.setTimeout(() => {
      resetDemo();
      setResetting(false);
      setResetDone(true);
      window.setTimeout(() => setResetDone(false), 1800);
    }, 1200);
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <div className="space-y-4">
        <section className="grid-field overflow-hidden rounded-[1.6rem] p-5 text-white md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="pill bg-clay-500 text-white"><TerminalSquare className="size-3" /> INTERNAL · FRONTEND SIMULATION</span><h2 className="mt-5 text-3xl font-black tracking-[-.05em] md:text-4xl">Demo state machine</h2><p className="mt-3 max-w-xl text-[11px] leading-5 text-white/45">One operator drives the transit beat, breach path, and reset while the presenter stays on the farmer and buyer surfaces.</p></div><span className="pill bg-white/7 text-white/60"><RadioTower className="size-3 text-leaf-400" /> {state.lastEvent}</span></div>

          <div className="mt-8 grid gap-2 sm:grid-cols-5">
            {[
              ["01", "Ready", state.status === "open"],
              ["02", "Escrowed", state.status === "escrowed"],
              ["03", "Transit", state.status === "in_transit"],
              ["04", "Breach", state.status === "breached"],
              ["05", "Settled", state.status === "settled"],
            ].map(([no, label, active]) => <div key={String(no)} className={`rounded-xl border p-3 ${active ? "border-leaf-400 bg-leaf-400 text-forest-950" : "border-white/9 bg-white/5 text-white/42"}`}><p className="font-mono text-[8px]">{String(no)}</p><p className="mt-3 text-[9px] font-black uppercase tracking-wider">{String(label)}</p></div>)}
          </div>
        </section>

        <section className="panel p-5 md:p-6">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Operator controls</p><h2 className="mt-2 text-xl font-black">Drive the three-minute loop.</h2></div><SlidersHorizontal className="size-5 text-ink-600" /></div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={seed} disabled={state.status !== "open"} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-cream-50 p-4 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-45"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-950 text-leaf-400"><LockKeyhole className="size-5" /></span><span><strong className="block text-xs">Load secured order</strong><small className="mt-1 block text-[9px] leading-4 text-ink-600">Seeds listing + demo escrow</small></span></button>
            <button onClick={startTransit} disabled={state.status !== "escrowed"} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-cream-50 p-4 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-45"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-950 text-leaf-400"><Play className="size-5" /></span><span><strong className="block text-xs">Start transit</strong><small className="mt-1 block text-[9px] leading-4 text-ink-600">Starts simulated telemetry</small></span></button>
            <button onClick={injectBreach} disabled={state.status !== "in_transit"} className="flex min-h-24 items-center gap-4 rounded-2xl border border-clay-500/15 bg-clay-100 p-4 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-45"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-clay-500 text-white"><Siren className="size-5" /></span><span><strong className="block text-xs text-clay-500">Inject breach</strong><small className="mt-1 block text-[9px] leading-4 text-clay-500/70">Arms 15% parametric discount</small></span></button>
            <button onClick={() => settleOrder(state.status === "breached")} disabled={!(["escrowed", "in_transit", "breached"] as string[]).includes(state.status)} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-leaf-100 p-4 text-left transition enabled:hover:-translate-y-0.5 disabled:opacity-45"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-leaf-400 text-forest-950"><Check className="size-5" /></span><span><strong className="block text-xs text-forest-700">Force settle</strong><small className="mt-1 block text-[9px] leading-4 text-forest-700/65">Fallback for judge waves</small></span></button>
          </div>

          <div className="mt-4 rounded-2xl border border-forest-950/9 p-4"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black">Telemetry speed</p><p className="mt-1 text-[8px] text-ink-600">Visual simulator only</p></div><span className="pill bg-cream-100 text-ink-600"><Gauge className="size-3" />{speed}%</span></div><input type="range" min="10" max="100" value={speed} onChange={(event) => setSpeed(Number(event.target.value))} className="mt-5 w-full accent-[#2f6b4b]" /></div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div className="panel p-5"><div className="flex items-start justify-between"><div><p className="eyebrow">Live event</p><h3 className="mt-2 text-lg font-black">Frontend event log</h3></div><CircleDot className="size-5 text-leaf-500" /></div><div className="mt-5 rounded-xl bg-forest-950 p-4 font-mono text-[8px] leading-5 text-leaf-400">{state.lastEvent}<br /><span className="text-white/35">order_id: YG-ORD-008</span><br /><span className="text-white/35">simulated: {state.status === "in_transit" || state.status === "breached" ? "true" : "false"}</span></div></div>
          <div className="panel p-5"><div className="flex items-start justify-between"><div><p className="eyebrow">Judge-facing</p><h3 className="mt-2 text-lg font-black">Surface shortcuts</h3></div><PackageOpen className="size-5 text-ink-600" /></div><div className="mt-5 space-y-2">{[["/farmer", "Amara’s phone"], ["/marketplace", "Chef Rosa’s dashboard"], ["/order", "Transit & delivery"]].map(([href, label]) => <Link key={href} href={href} className="flex min-h-11 items-center justify-between rounded-xl bg-cream-50 px-3 text-[9px] font-black">{label}<ArrowRight className="size-3.5" /></Link>)}</div></div>
        </section>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-28">
        <section className="panel p-5"><div className="flex items-start justify-between"><div><p className="eyebrow">Go / no-go checklist</p><h2 className="mt-2 text-xl font-black">Demo readiness</h2></div><span className="pill bg-leaf-100 text-forest-700"><Check className="size-3" /> All green</span></div><div className="mt-5 space-y-2">{READINESS_SERVICES.map((service) => <div key={service} className="flex min-h-11 items-center gap-3 rounded-xl bg-cream-50 px-3"><span className="size-2 rounded-full bg-leaf-500 shadow-[0_0_0_5px_rgba(155,195,61,.13)]" /><span className="flex-1 text-[9px] font-black">{service}</span><span className="font-mono text-[7px] uppercase text-ink-600">demo ready</span></div>)}</div><p className="mt-4 text-[8px] leading-4 text-ink-600">Visual readiness only in this frontend repository; service health must later come from the Spring Boot backend.</p></section>

        <section className="overflow-hidden rounded-[1.5rem] bg-clay-100 p-5"><div className="flex items-start justify-between"><span className="grid size-11 place-items-center rounded-xl bg-clay-500 text-white"><RefreshCcw className={`size-5 ${resetting ? "animate-spin" : ""}`} /></span>{resetDone && <span className="pill bg-white text-forest-700"><Check className="size-3" /> Ready</span>}</div><h3 className="mt-8 text-2xl font-black tracking-[-.04em] text-clay-500">Reset between judge waves.</h3><p className="mt-3 text-[10px] leading-5 text-clay-500/70">Clears the shared frontend state and returns every surface to the opening beat.</p><button onClick={reset} disabled={resetting} className="mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-clay-500 text-[10px] font-black text-white"><RefreshCcw className={`size-4 ${resetting ? "animate-spin" : ""}`} />{resetting ? "Resetting demo..." : "RESET FULL DEMO"}</button></section>

        <section className="grid-field rounded-[1.5rem] p-5 text-white"><AlertTriangle className="size-5 text-leaf-400" /><p className="eyebrow mt-5 !text-leaf-400">Honesty rule</p><p className="mt-2 text-[11px] font-black">Transit and telemetry are simulated.</p><p className="mt-2 text-[9px] leading-4 text-white/42">This label stays visible everywhere those signals appear. Payment and proof integrations are UI contracts until the backend is connected.</p></section>
      </aside>
    </div>
  );
}
