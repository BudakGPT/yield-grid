import type { Metadata } from "next";
import { BadgeCheck, Blocks, CheckCircle2, CircleDashed, ExternalLink, Fingerprint, RadioTower, ShieldCheck } from "lucide-react";
import { CopyProofButton } from "@/components/copy-proof-button";
import { PageIntro } from "@/components/page-intro";
import { Reveal } from "@/components/reveal";
import { proofEvents } from "@/lib/data";

export const metadata: Metadata = { title: "Verification | YieldGrid" };

const merkleRoot = "0x84c17fa29d0b66e123c7b91e7d04165f9a92f3a6cd439c1e6497e9ae2";

export default function VerificationPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Proof network · Polygon Amoy" title="Bukti yang ikut bergerak." description="Setiap timbang, perubahan kualitas, dan perpindahan hak dicatat sebagai jejak audit yang dapat diverifikasi." action={<span className="pill bg-leaf-100 text-forest-700"><RadioTower className="size-3" /> Network healthy</span>} />

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
        <Reveal className="grid-field relative min-h-[420px] overflow-hidden rounded-[1.6rem] p-6 text-white md:p-8">
          <div className="absolute right-[-110px] top-[-150px] size-[390px] rounded-full border border-leaf-400/18" />
          <div className="absolute right-[-20px] top-[-60px] size-[250px] rounded-full border border-dashed border-white/12" />
          <div className="relative flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><Fingerprint className="size-5" /></span><span className="pill bg-white/7 text-white/60"><Blocks className="size-3" /> Block #12,849,207</span></div>
          <div className="relative mt-20 max-w-xl">
            <p className="eyebrow !text-leaf-400">Latest merkle root</p>
            <h2 className="mt-3 text-[clamp(2.2rem,5vw,4.8rem)] font-black leading-[.88] tracking-[-.06em]">Satu hash.<br />Seluruh perjalanan.</h2>
            <p className="mt-5 break-all font-mono text-[10px] leading-5 text-white/42">{merkleRoot}</p>
            <div className="mt-5"><CopyProofButton value={merkleRoot} /></div>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="panel flex flex-col p-5 md:p-6">
          <div className="flex items-start justify-between"><div><p className="eyebrow">Network pulse</p><h2 className="mt-2 text-xl font-black tracking-tight">Proof integrity</h2></div><BadgeCheck className="size-8 text-forest-700" /></div>
          <div className="mt-8 flex flex-1 items-center justify-center">
            <div className="relative grid size-52 place-items-center rounded-full border border-forest-950/10">
              <div className="absolute inset-4 rounded-full border border-dashed border-leaf-500/50" />
              <div className="text-center"><p className="text-5xl font-black tracking-[-.07em] text-forest-950">99.8<span className="text-xl">%</span></p><p className="mt-2 text-[8px] font-bold uppercase tracking-[.17em] text-ink-600">proof confirmed</p></div>
              <span className="absolute left-3 top-12 size-3 rounded-full bg-leaf-400 shadow-[0_0_0_8px_rgba(155,195,61,.13)]" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[["2,418", "Events"], ["1.2s", "Latency"], ["0", "Conflicts"]].map(([value, label]) => <div key={label} className="rounded-xl bg-cream-50 p-3 text-center"><p className="text-sm font-black">{value}</p><p className="mt-1 text-[8px] uppercase tracking-wider text-ink-600">{label}</p></div>)}
          </div>
        </Reveal>
      </div>

      <Reveal className="panel mt-4 overflow-hidden">
        <div className="flex items-center justify-between border-b border-forest-950/8 p-5"><div><p className="eyebrow">Immutable event stream</p><h2 className="mt-2 text-lg font-black">Aktivitas terverifikasi</h2></div><button className="soft-button">Explorer <ExternalLink className="size-3.5" /></button></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-cream-50 text-[8px] font-extrabold uppercase tracking-[.14em] text-ink-600"><tr><th className="px-5 py-4">Time</th><th className="px-4 py-4">Event</th><th className="px-4 py-4">Batch</th><th className="px-4 py-4">Actor</th><th className="px-4 py-4">Proof</th><th className="px-4 py-4">Status</th></tr></thead>
            <tbody>{proofEvents.map((event) => <tr key={event.time} className="border-t border-forest-950/7 text-[10px]"><td className="px-5 py-4 font-mono text-ink-600">{event.time}</td><td className="px-4 py-4 font-extrabold text-forest-950">{event.event}</td><td className="px-4 py-4 font-mono text-ink-600">{event.batch}</td><td className="px-4 py-4 font-semibold">{event.actor}</td><td className="px-4 py-4 font-mono text-[9px] text-forest-700">{event.hash}</td><td className="px-4 py-4"><span className={`pill ${event.status === "Confirmed" ? "bg-leaf-100 text-forest-700" : "bg-cream-100 text-ink-600"}`}>{event.status === "Confirmed" ? <CheckCircle2 className="size-3" /> : <CircleDashed className="size-3" />}{event.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </Reveal>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {[[ShieldCheck, "Tamper-evident", "Perubahan setelah pencatatan akan langsung terdeteksi."], [Blocks, "Batch anchored", "Bukti diringkas agar transaksi tetap ringan dan efisien."], [BadgeCheck, "Buyer verifiable", "Pembeli bisa mengecek asal produk tanpa akun khusus."]].map(([Icon, title, copy]) => { const ItemIcon = Icon as typeof ShieldCheck; return <Reveal key={String(title)} className="panel p-5"><ItemIcon className="size-5 text-forest-700" /><h3 className="mt-5 text-sm font-black">{String(title)}</h3><p className="mt-2 text-[10px] leading-5 text-ink-600">{String(copy)}</p></Reveal>; })}
      </div>
    </main>
  );
}
