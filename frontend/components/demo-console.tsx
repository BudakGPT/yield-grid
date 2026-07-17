"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, Check, CircleDot, Gauge, PackageOpen, Play, RadioTower, RefreshCcw, Siren, TerminalSquare } from "lucide-react";
import { api } from "@/lib/api";
import { useDemo } from "./demo-provider";

export function DemoConsole() {
  const { state, startTransit, injectBreach, settleOrder, resetDemo } = useDemo();
  const [health, setHealth] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshHealth = () => api.demoHealth().then(setHealth).catch((reason) => setError(reason instanceof Error ? reason.message : "Health check failed"));
  useEffect(() => { void refreshHealth(); }, []);

  const run = async (name: string, action: () => Promise<void>) => {
    setBusy(name);
    setError(null);
    try {
      await action();
      await refreshHealth();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : `${name} failed`);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_390px]">
      <div className="space-y-4">
        <section className="grid-field overflow-hidden rounded-[1.6rem] p-5 text-white md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4"><div><span className="pill bg-clay-500 text-white"><TerminalSquare className="size-3" /> INTERNAL · SIMULATED TRANSIT CONTROLS</span><h2 className="mt-5 text-3xl font-black md:text-4xl">Backend demo state machine</h2><p className="mt-3 max-w-xl text-[11px] leading-5 text-white/45">These buttons call the unauthenticated, non-routable demo endpoints. Money still moves only through buyer/admin-authorized contract calls.</p></div><span className="pill bg-white/7 text-white/60"><RadioTower className="size-3 text-leaf-400" /> {state.lastEvent}</span></div>
          <div className="mt-8 grid gap-2 sm:grid-cols-5">{[["01", "Ready", state.status === "open"], ["02", "Escrowed", state.status === "escrowed"], ["03", "Transit", state.status === "in_transit"], ["04", "Breach", state.status === "breached"], ["05", "Settled", state.status === "settled"]].map(([no, label, active]) => <div key={String(no)} className={`rounded-xl border p-3 ${active ? "border-leaf-400 bg-leaf-400 text-forest-950" : "border-white/9 bg-white/5 text-white/42"}`}><p className="font-mono text-[8px]">{String(no)}</p><p className="mt-3 text-[9px] font-black uppercase">{String(label)}</p></div>)}</div>
        </section>

        <section className="panel p-5 md:p-6">
          <p className="eyebrow">Operator controls</p><h2 className="mt-2 text-xl font-black">Drive the three-minute loop.</h2>
          {error && <p className="mt-4 rounded-xl bg-clay-100 p-3 text-[10px] font-bold text-clay-500">{error}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button onClick={() => run("transit", startTransit)} disabled={state.status !== "escrowed" || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-cream-50 p-4 text-left disabled:opacity-45"><Play className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Start transit</strong><small className="text-[8px] text-ink-600">Writes SIMULATED telemetry</small></span></button>
            <button onClick={() => run("breach", injectBreach)} disabled={!(["escrowed", "in_transit"].includes(state.status)) || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-clay-500/20 bg-clay-100 p-4 text-left disabled:opacity-45"><Siren className="size-5 text-clay-500" /><span><strong className="block text-[10px]">Inject breach</strong><small className="text-[8px] text-ink-600">Arms the discount path</small></span></button>
            <button onClick={() => run("settlement", settleOrder)} disabled={!(["in_transit", "breached"].includes(state.status)) || busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-leaf-100 p-4 text-left disabled:opacity-45"><Check className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Force verify fallback</strong><small className="text-[8px] text-ink-600">Requires signed-in buyer session</small></span></button>
            <button onClick={() => run("reset", resetDemo)} disabled={busy !== null} className="flex min-h-24 items-center gap-4 rounded-2xl border border-forest-950/9 bg-white p-4 text-left disabled:opacity-45"><RefreshCcw className="size-5 text-forest-700" /><span><strong className="block text-[10px]">Reset database demo data</strong><small className="text-[8px] text-ink-600">Accounts and contract persist</small></span></button>
          </div>
          {!state.orderId && <div className="mt-4 rounded-xl bg-cream-100 p-4 text-[9px] text-ink-600"><PackageOpen className="mr-2 inline size-4" />No active order. Create a real farmer listing and buy it from the marketplace. <Link href="/marketplace" className="ml-2 font-black text-forest-700">Open market <ArrowRight className="inline size-3" /></Link></div>}
        </section>
      </div>

      <aside className="panel h-fit p-5 xl:sticky xl:top-28">
        <div className="flex items-start justify-between"><div><p className="eyebrow">Readiness</p><h2 className="mt-2 text-xl font-black">Live service checks.</h2></div><button onClick={refreshHealth} className="grid size-10 place-items-center rounded-xl bg-cream-100"><RefreshCcw className="size-4" /></button></div>
        <div className="mt-5 space-y-2">{Object.entries(health).filter(([, value]) => typeof value === "string").map(([service, status]) => { const ready = status === "ready" || status === "live"; return <div key={service} className="flex items-center justify-between rounded-xl bg-cream-50 p-3"><span className="flex items-center gap-2 text-[9px] font-black"><CircleDot className={`size-3 ${ready ? "text-leaf-500" : status === "simulated" || status === "rehearsal-cache" ? "text-clay-500" : "text-ink-600"}`} />{service}</span><span className="font-mono text-[8px] uppercase text-ink-600">{String(status)}</span></div>; })}</div>
        <div className="mt-5 rounded-xl bg-clay-100 p-4 text-[9px] leading-5 text-clay-500"><AlertTriangle className="mr-2 inline size-4" /><strong>Honesty status:</strong> transit is simulated; rehearsal grading is a disclosed cache; Stellar reports ready only when the sidecar and deployed contract are configured.</div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-forest-950 p-4 text-white"><Gauge className="size-4 text-leaf-400" /><p className="text-[8px]">Active order<br /><span className="font-mono text-white/45">{state.orderId || "none"}</span></p></div>
      </aside>
    </div>
  );
}
