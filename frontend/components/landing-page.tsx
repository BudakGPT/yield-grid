"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, HeartHandshake, LayoutDashboard, PackageOpen, RadioTower, Route, ScanLine, ShieldCheck, Sparkles } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { HarvestTwin } from "./harvest-twin";
import { Reveal } from "./reveal";

const crops = {
  tomato: { title: "Tomat Grade A", batch: "#YG-TMT-072 · Pangalengan", weight: "486 kg", confidence: "91%", freshness: "18h" },
  mango: { title: "Mangga Grade B", batch: "#YG-MNG-118 · Indramayu", weight: "720 kg", confidence: "88%", freshness: "46h" },
  chili: { title: "Cabai Grade A", batch: "#YG-CBI-041 · Garut", weight: "214 kg", confidence: "93%", freshness: "31h" },
} as const;

const features = [
  { href: "/overview", icon: LayoutDashboard, no: "01", title: "Control tower", copy: "Pasokan, risiko kesegaran, dan dampak lintas koridor dalam satu pandangan." },
  { href: "/batches", icon: ScanLine, no: "02", title: "AI harvest scan", copy: "Ubah foto menjadi estimasi grade, berat, dan paspor batch." },
  { href: "/rescue", icon: HeartHandshake, no: "03", title: "Rescue market", copy: "Temukan pembeli alternatif sebelum surplus kehilangan nilai." },
  { href: "/logistics", icon: Route, no: "04", title: "Shared logistics", copy: "Cocokkan muatan dengan armada kosong dan rute yang tepat." },
  { href: "/verification", icon: ShieldCheck, no: "05", title: "Verified proof", copy: "Buat bukti panen dan serah-terima yang mudah diaudit." },
];

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const storyRef = useRef<HTMLElement>(null);
  const [activeCrop, setActiveCrop] = useState<keyof typeof crops>("tomato");
  const crop = crops[activeCrop];
  const { scrollYProgress: heroProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const { scrollYProgress: storyProgressRaw } = useScroll({ target: storyRef, offset: ["start end", "end start"] });
  const storyProgress = useSpring(storyProgressRaw, { stiffness: 90, damping: 24, mass: .4 });
  const headlineY = useTransform(heroProgress, [0, 1], [0, 105]);
  const modelY = useTransform(heroProgress, [0, 1], [0, -70]);
  const wordY = useTransform(heroProgress, [0, 1], [0, 180]);
  const storyRotate = useTransform(storyProgress, [0, 1], [0, 120]);
  const firstX = useTransform(storyProgress, [0, .35, 1], [-80, 0, -25]);
  const secondX = useTransform(storyProgress, [0, .48, 1], [90, 0, 30]);
  const thirdY = useTransform(storyProgress, [0, .64, 1], [100, 0, -20]);

  return (
    <>
      <section ref={heroRef} className="hero-field relative isolate overflow-hidden text-white">
        <motion.div style={{ y: wordY }} className="pointer-events-none absolute -bottom-[6vw] -left-[2vw] -z-10 select-none text-[clamp(12rem,27vw,30rem)] font-extrabold leading-[.7] tracking-[-.1em] text-white/[0.035]">YIELD</motion.div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="site-container grid min-h-[720px] gap-10 py-14 lg:grid-cols-[.86fr_1.14fr] lg:items-center lg:py-16">
          <motion.div style={{ y: headlineY }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: [0.22,1,.36,1] }} className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center gap-2"><span className="pill bg-leaf-400 text-forest-950"><RadioTower className="size-3" /> Live food-system intelligence</span><span className="font-mono text-[9px] uppercase tracking-[.16em] text-white/42">Built for Indonesia</span></div>
            <h1 className="text-[clamp(3.25rem,6vw,5.8rem)] font-extrabold leading-[.91] tracking-[-.08em]">Setiap panen<br /><span className="text-[#e9efad]">punya jalan.</span></h1>
            <p className="mt-6 max-w-xl text-sm font-medium leading-[1.75] text-white/62 sm:text-base">YieldGrid menghubungkan bukti visual, prediksi kesegaran, buyer alternatif, dan logistik agar hasil petani sampai ke pasar.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/overview" className="inline-flex items-center gap-2 rounded-xl bg-leaf-400 px-5 py-3.5 text-xs font-extrabold text-forest-950 transition hover:-translate-y-0.5">Masuk control tower <ArrowUpRight className="size-4" /></Link><Link href="/batches" className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/7 px-5 py-3.5 text-xs font-bold"><Camera className="size-4" /> Lihat harvest scan</Link></div>
            <div className="mt-9 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-5">{[["12.8t","Yield visible"],["3.6t","Waste rescued"],["91%","AI confidence"]].map(([value,label]) => <div key={label} className="px-4 first:pl-0"><div className="text-2xl font-extrabold text-[#f4f5b5]">{value}</div><div className="mt-1 text-[8px] font-bold uppercase tracking-[.13em] text-white/38">{label}</div></div>)}</div>
          </motion.div>

          <motion.article style={{ y: modelY }} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .9, delay: .1 }} className="relative min-h-[540px] overflow-hidden rounded-[2rem] border border-white/12 bg-forest-950/62 shadow-[0_32px_90px_rgba(0,0,0,.28)] backdrop-blur-sm">
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-6"><div><div className="font-mono text-[9px] uppercase tracking-[.15em] text-leaf-400">Live digital twin</div><div className="mt-1 text-[10px] font-bold text-white/48">{crop.batch}</div></div><span className="pill border border-white/12 bg-white/8"><Sparkles className="size-3 text-leaf-400" /> Object tracked</span></div>
            <div className="absolute inset-0"><HarvestTwin crop={activeCrop} /></div>
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-forest-950 via-forest-950/90 to-transparent px-5 pb-5 pt-28 sm:px-6 sm:pb-6">
              <h2 className="text-3xl font-extrabold leading-[.98] tracking-[-.06em] text-[#f4f5b5] sm:text-4xl">{crop.title}<br /><span className="text-white/52">verified in 3D.</span></h2>
              <div className="mt-4 flex flex-wrap items-end justify-between gap-4"><div className="flex flex-wrap gap-2">{[[crop.weight,"volume"],[crop.confidence,"confidence"],[crop.freshness,"freshness"]].map(([value,label]) => <span key={label} className="rounded-xl border border-white/12 bg-white/8 px-3 py-2 font-mono text-xs text-leaf-400">{value}<small className="ml-2 text-[8px] uppercase text-white/35">{label}</small></span>)}</div><div className="flex gap-2">{(Object.keys(crops) as (keyof typeof crops)[]).map((key) => <button key={key} onClick={() => setActiveCrop(key)} aria-label={`Pilih ${key}`} className={`size-9 rounded-xl border ${activeCrop === key ? "border-leaf-400 bg-leaf-400" : "border-white/15 bg-white/8"}`} />)}</div></div>
            </div>
          </motion.article>
        </div>
      </section>

      <div className="overflow-hidden border-y border-forest-950/10 bg-[#e5e9a4] py-4"><motion.div className="flex w-max gap-10 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[.16em] text-forest-800" animate={{ x: [0, -760] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>{Array.from({ length: 3 }).flatMap(() => ["Scan harvest","Estimate yield","Anchor proof","Match buyers","Move smarter","Reduce waste"]).map((item,index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-10">{item}<i className="size-1.5 rounded-full bg-leaf-500" /></span>)}</motion.div></div>

      <div className="site-container py-14 sm:py-16">
        <Reveal className="grid gap-8 border-b border-black/8 pb-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><span className="eyebrow">From evidence to action</span><h2 className="mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-5xl">Bukan dashboard lagi.<br /><span className="text-ink-600/40">Ini sistem kerja.</span></h2></div><p className="max-w-2xl text-sm leading-[1.8] text-ink-600">Setiap fitur kini menjadi route Next.js tersendiri. Tim lapangan, koperasi, pembeli, dan operator dapat berpindah konteks tanpa kehilangan state layout utama.</p></Reveal>

        <Reveal className="relative mt-10 grid overflow-hidden rounded-[2rem] bg-[#dfe79a] p-6 sm:p-9 lg:grid-cols-[.9fr_1.1fr] lg:items-end lg:p-10"><div><span className="font-mono text-[9px] font-bold uppercase tracking-[.18em] text-forest-700">Live impact · 7 days</span><div className="mt-8 text-[clamp(5rem,13vw,12rem)] font-extrabold leading-[.7] tracking-[-.09em]">3.6t</div><div className="mt-5 text-[9px] font-extrabold uppercase tracking-[.16em] text-forest-950/45">Food loss prevented</div></div><div><h3 className="text-3xl font-extrabold leading-[.98] tracking-[-.06em] sm:text-4xl">Data bergerak secepat hasil panen.</h3><p className="mt-4 max-w-xl text-xs leading-[1.7] text-forest-950/58">Perubahan grade, waktu segar, buyer match, dan kapasitas armada langsung mengubah keputusan koridor.</p><div className="mt-7 grid grid-cols-3 border-t border-forest-950/15 pt-5">{[["18","Live batches"],["7","Vehicles"],["4","Market nodes"]].map(([value,label]) => <div key={label}><b className="text-xl">{value}</b><span className="mt-1 block text-[8px] uppercase text-forest-950/45">{label}</span></div>)}</div></div></Reveal>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-5">{features.map(({ href, icon: Icon, no, title, copy }, index) => <Reveal key={href} delay={index * .04}><Link href={href} className="panel group block min-h-[230px] p-5 transition hover:-translate-y-1"><div className="flex items-center justify-between"><span className="grid size-10 place-items-center rounded-xl bg-leaf-100 text-forest-700"><Icon className="size-4" /></span><span className="font-mono text-[9px] text-ink-600/45">{no}/05</span></div><h3 className="mt-7 text-lg font-extrabold tracking-[-.04em]">{title}</h3><p className="mt-2.5 text-[10px] leading-relaxed text-ink-600">{copy}</p><span className="mt-5 flex items-center gap-2 text-[10px] font-extrabold text-forest-700">Buka halaman <ArrowRight className="size-3.5 transition group-hover:translate-x-1" /></span></Link></Reveal>)}</div>

        <section ref={storyRef} className="relative mt-14 lg:min-h-[170vh]">
          <div className="grid-field overflow-hidden rounded-[2rem] p-6 text-white lg:sticky lg:top-[76px] lg:h-[calc(100vh-76px)] lg:min-h-[680px] lg:p-10">
            <div className="max-w-xl"><span className="font-mono text-[9px] uppercase tracking-[.16em] text-leaf-400">Scroll to follow the harvest</span><h2 className="mt-3 text-4xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-5xl">Satu panen.<br /><span className="text-white/40">Tiga keputusan.</span></h2></div>
            <motion.div style={{ rotate: storyRotate }} className="absolute left-[55%] top-1/2 hidden size-[min(48vw,650px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-leaf-400/20 shadow-[0_0_0_8vw_rgba(183,215,90,.025),0_0_0_16vw_rgba(183,215,90,.015)] lg:block"><div className="absolute inset-[18%] rounded-full border border-dashed border-white/15" /><i className="absolute left-1/2 top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-leaf-400 shadow-[0_0_30px_#b7d75a]" /></motion.div>
            <div className="mt-10 grid gap-3 lg:hidden">{[[Camera,"01 · Capture","Bukti dimulai dari kebun."],[ScanLine,"02 · Understand","AI membaca risiko."],[Route,"03 · Move","Pasar dan armada bertemu."]].map(([Icon,label,title]) => { const StoryIcon = Icon as typeof Camera; return <article key={String(label)} className="rounded-2xl border border-white/12 bg-white/8 p-5"><StoryIcon className="size-5 text-leaf-400" /><span className="mt-4 block font-mono text-[8px] text-white/38">{String(label)}</span><h3 className="mt-2 text-lg font-extrabold">{String(title)}</h3></article>; })}</div>
            <motion.article style={{ x: firstX }} className="absolute left-[7%] top-[42%] hidden w-[290px] rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-xl lg:block"><Camera className="size-5 text-leaf-400" /><span className="mt-4 block font-mono text-[8px] text-white/38">01 · CAPTURE</span><h3 className="mt-2 text-lg font-extrabold">Bukti dimulai dari kebun.</h3><p className="mt-2 text-[10px] text-white/48">Foto, kartu ukuran, lokasi, dan waktu membentuk identitas batch.</p></motion.article>
            <motion.article style={{ x: secondX }} className="absolute right-[7%] top-[23%] hidden w-[290px] rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-xl lg:block"><ScanLine className="size-5 text-leaf-400" /><span className="mt-4 block font-mono text-[8px] text-white/38">02 · UNDERSTAND</span><h3 className="mt-2 text-lg font-extrabold">AI membaca risiko.</h3><p className="mt-2 text-[10px] text-white/48">Grade, estimasi berat, dan freshness window menjadi keputusan.</p></motion.article>
            <motion.article style={{ y: thirdY }} className="absolute bottom-[14%] right-[20%] hidden w-[290px] rounded-3xl border border-white/12 bg-white/8 p-5 backdrop-blur-xl lg:block"><Route className="size-5 text-leaf-400" /><span className="mt-4 block font-mono text-[8px] text-white/38">03 · MOVE</span><h3 className="mt-2 text-lg font-extrabold">Pasar dan armada bertemu.</h3><p className="mt-2 text-[10px] text-white/48">Surplus dialihkan melalui kapasitas logistik terdekat.</p></motion.article>
            <motion.div style={{ scaleX: storyProgress }} className="absolute inset-x-[7%] bottom-[7%] hidden h-px origin-left bg-leaf-400 lg:block" />
          </div>
        </section>

        <Reveal className="mt-14 grid overflow-hidden rounded-[2rem] bg-[#e5e9a4] lg:grid-cols-[1.08fr_.92fr]"><div className="p-7 sm:p-10 lg:p-14"><span className="pill bg-forest-950 text-white">One connected flow</span><h2 className="mt-6 text-4xl font-extrabold leading-[.98] tracking-[-.065em] sm:text-5xl">Foto menjadi bukti.<br />Bukti menjadi keputusan.</h2><div className="mt-10 grid gap-5 sm:grid-cols-3">{[["01","Capture"],["02","Understand"],["03","Move"]].map(([no,label]) => <div key={no} className="border-t border-forest-950/18 pt-4"><span className="font-mono text-[9px] text-forest-700">{no}</span><b className="mt-2 block text-sm">{label}</b></div>)}</div></div><div className="farm-photo min-h-[420px]" /></Reveal>

        <Reveal className="relative mt-14 flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-forest-950 p-8 text-white sm:p-11 lg:flex-row lg:items-end lg:justify-between"><div className="absolute -right-5 -top-16 text-[15rem] font-extrabold text-white/[0.025]">01</div><div className="relative"><span className="eyebrow !text-leaf-400">Ready for the next harvest</span><h2 className="mt-4 text-[clamp(2.7rem,5.6vw,5.5rem)] font-extrabold leading-[.92] tracking-[-.07em]">Mulai dari satu foto.<br /><span className="text-white/38">Lihat ke mana panenmu pergi.</span></h2></div><Link href="/batches" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-leaf-400 px-5 py-3.5 text-xs font-extrabold text-forest-950"><PackageOpen className="size-4" /> Buka harvest batches</Link></Reveal>
      </div>
    </>
  );
}
