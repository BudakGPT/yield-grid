import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Boxes, CircleDollarSign, Leaf, PackageCheck, Radar, Route } from "lucide-react";
import { HarvestTwin } from "@/components/harvest-twin";
import { MetricCard } from "@/components/metric-card";
import { PageIntro } from "@/components/page-intro";
import { Reveal } from "@/components/reveal";
import { YieldChart } from "@/components/yield-chart";
import { harvestBatches } from "@/lib/data";

export const metadata: Metadata = { title: "Overview | YieldGrid" };

export default function OverviewPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Control room · 16 Juli 2026" title="Selamat pagi, Dimas." description="Satu pandangan untuk hasil panen, pergerakan armada, rescue market, dan bukti yang sudah terverifikasi." action={<Link href="/batches" className="primary-button">Lihat semua batch <ArrowRight className="size-4" /></Link>} />

      <Reveal className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Panen tercatat" value="42.8 ton" change="12.4%" note="dibanding minggu lalu" icon={Leaf} dark />
        <MetricCard label="Batch aktif" value="18" change="4 baru" note="6 sedang dalam perjalanan" icon={Boxes} />
        <MetricCard label="Nilai terselamatkan" value="Rp18.7jt" change="8.1%" note="surplus masuk rescue market" icon={CircleDollarSign} />
        <MetricCard label="Proof terverifikasi" value="99.8%" change="Live" note="2.418 event tercatat" icon={PackageCheck} />
      </Reveal>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
        <Reveal><YieldChart /></Reveal>
        <Reveal delay={0.08} className="grid-field relative min-h-[420px] overflow-hidden rounded-[1.5rem] text-white">
          <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6"><div><p className="eyebrow !text-white/42">Digital harvest twin</p><h2 className="mt-2 text-xl font-black tracking-tight">YG-240731 · Tomat</h2></div><span className="pill bg-leaf-400 text-forest-950"><Radar className="size-3" /> Live</span></div>
          <div className="absolute inset-0 pt-16"><HarvestTwin crop="tomato" /></div>
          <div className="absolute inset-x-4 bottom-4 z-10 grid grid-cols-3 gap-2">
            {[["Estimasi", "860 kg"], ["Kematangan", "92%"], ["Grade", "A"]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-forest-950/75 p-3 backdrop-blur"><p className="text-[8px] uppercase tracking-wider text-white/35">{label}</p><p className="mt-1 text-xs font-black">{value}</p></div>)}
          </div>
        </Reveal>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_340px]">
        <Reveal className="panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-forest-950/8 p-5"><div><p className="eyebrow">Aktivitas terbaru</p><h2 className="mt-2 text-lg font-black">Batch bergerak hari ini</h2></div><Link href="/batches" className="soft-button">Semua batch <ArrowRight className="size-3.5" /></Link></div>
          <div className="divide-y divide-forest-950/7">
            {harvestBatches.slice(0, 4).map((batch) => <Link href="/batches" key={batch.id} className="group grid grid-cols-[1fr_auto] items-center gap-3 p-4 transition hover:bg-cream-50 sm:grid-cols-[1.2fr_1fr_auto]"><div><p className="text-[11px] font-extrabold text-forest-950">{batch.crop} · {batch.id}</p><p className="mt-1 text-[9px] text-ink-600">{batch.farmer} · {batch.location}</p></div><p className="hidden text-[10px] font-bold text-ink-600 sm:block">{batch.weight.toLocaleString("id-ID")} kg · Grade {batch.grade}</p><ArrowRight className="size-3.5 text-ink-600/35 transition group-hover:translate-x-1" /></Link>)}
          </div>
        </Reveal>
        <Reveal delay={0.08} className="farm-photo flex min-h-[390px] flex-col justify-between overflow-hidden rounded-[1.5rem] p-5 text-white">
          <div className="flex justify-between"><span className="pill bg-white/12 text-white"><Route className="size-3" /> Corridor pulse</span><span className="size-2 rounded-full bg-leaf-400 shadow-[0_0_0_6px_rgba(183,215,90,.16)]" /></div>
          <div><p className="eyebrow !text-leaf-400">Next opportunity</p><h2 className="mt-3 text-3xl font-black leading-[.95] tracking-[-.05em]">Rescue cabai sebelum 18:20.</h2><p className="mt-3 text-[11px] leading-5 text-white/55">Permintaan pembeli Jakarta cocok 87% dengan surplus Garut.</p><Link href="/rescue" className="mt-5 inline-flex items-center gap-2 text-[10px] font-extrabold text-leaf-400">Buka rescue market <ArrowRight className="size-3.5" /></Link></div>
        </Reveal>
      </div>
    </main>
  );
}
