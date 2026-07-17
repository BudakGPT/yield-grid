"use client";

import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Camera, Factory, HandCoins, LockKeyhole, ScanLine, ShieldCheck, ShoppingBasket, Sparkles, Truck } from "lucide-react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { HarvestTwin } from "./harvest-twin";
import { Reveal } from "./reveal";

const demoBeats = [
  { no: "01", icon: Camera, title: "Scan the crate", copy: "Petani memotret hasil panen untuk mendapatkan perkiraan kualitas visual dan umur simpan." },
  { no: "02", icon: ShoppingBasket, title: "Buy direct", copy: "Pembeli melihat grade mix, umur simpan, lokasi petani, dan harga sebelum membeli langsung." },
  { no: "03", icon: LockKeyhole, title: "Pay safely", copy: "Pembayaran dilindungi dan diteruskan ke petani setelah delivery diverifikasi." },
  { no: "04", icon: Factory, title: "Route, don’t waste", copy: "Batch cepat matang atau Grade B diarahkan ke wholesaler dan processor yang memang membutuhkannya." },
];

export function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 320, damping: 24, mass: .15 });
  const headlineY = useTransform(smooth, [0, 1], [0, 220]);
  const modelY = useTransform(smooth, [0, 1], [0, -180]);
  const ghostY = useTransform(smooth, [0, 1], [0, 340]);
  const headlineX = useSpring(useTransform(pointerX, [-1, 1], [-18, 18]), { stiffness: 620, damping: 27, mass: .12 });
  const modelX = useSpring(useTransform(pointerX, [-1, 1], [-34, 34]), { stiffness: 620, damping: 25, mass: .12 });
  const modelRotateX = useSpring(useTransform(pointerY, [-1, 1], [11, -11]), { stiffness: 580, damping: 24, mass: .12 });
  const modelRotateY = useSpring(useTransform(pointerX, [-1, 1], [-13, 13]), { stiffness: 580, damping: 24, mass: .12 });
  const accentX = useSpring(useTransform(pointerX, [-1, 1], [-130, 130]), { stiffness: 500, damping: 23, mass: .12 });
  const accentY = useSpring(useTransform(pointerY, [-1, 1], [-80, 80]), { stiffness: 500, damping: 23, mass: .12 });

  const trackPointer = (event: React.PointerEvent<HTMLElement>) => {
    if (reduceMotion || event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - bounds.left) / bounds.width - .5) * 2.4);
    pointerY.set(((event.clientY - bounds.top) / bounds.height - .5) * 2.4);
  };

  const resetPointer = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <>
      <section ref={heroRef} onPointerMove={trackPointer} onPointerLeave={resetPointer} className="hero-field relative isolate overflow-hidden text-white">
        <motion.div style={{ y: ghostY }} className="pointer-events-none absolute -bottom-[5vw] -left-[3vw] -z-10 select-none text-[clamp(11rem,25vw,29rem)] font-black leading-[.7] tracking-[-.11em] text-white/[0.035]">DIRECT</motion.div>
        <motion.div style={{ x: accentX, y: accentY }} className="pointer-events-none absolute right-[14%] top-[18%] -z-10 size-[420px] rounded-full bg-leaf-400/10 blur-[85px]" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
        <div className="site-container grid min-h-[750px] gap-10 py-14 lg:grid-cols-[.92fr_1.08fr] lg:items-center lg:py-16">
          <motion.div style={{ y: headlineY, x: headlineX }} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .62, ease: [0.22, 1, .36, 1] }} className="relative z-10">
            <div className="mb-6 flex flex-wrap items-center gap-2"><span className="pill bg-leaf-400 text-forest-950"><Sparkles className="size-3" /> Direct farm marketplace</span></div>
            <h1 className="text-[clamp(3.2rem,6.4vw,6.4rem)] font-black leading-[.86] tracking-[-.085em]">Buy straight<br />from the <span className="text-[#e9efad]">farm.</span></h1>
            <p className="mt-7 max-w-xl text-sm font-medium leading-[1.8] text-white/62 sm:text-base">Kualitas terverifikasi dan pembayaran aman membuat pembeli kota bisa membeli langsung dari petani—tanpa markup broker kualitas—sementara shelf-life matching menjaga hasil panen tetap bernilai.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/marketplace" className="inline-flex items-center gap-2 rounded-xl bg-leaf-400 px-5 py-3.5 text-xs font-extrabold text-forest-950 transition hover:-translate-y-0.5">Browse verified produce <ArrowUpRight className="size-4" /></Link><Link href="/farmer" className="inline-flex items-center gap-2 rounded-xl border border-white/14 bg-white/7 px-5 py-3.5 text-xs font-bold"><ScanLine className="size-4" /> Open farmer scan</Link></div>
            <div className="mt-10 grid max-w-xl grid-cols-3 divide-x divide-white/10 border-y border-white/10 py-5">{[["Visual", "Photo grading"], ["Estimated", "Shelf life"], ["Protected", "Direct payment"]].map(([value, label]) => <div key={label} className="px-4 first:pl-0"><div className="text-xl font-black text-[#f4f5b5] sm:text-2xl">{value}</div><div className="mt-1 text-[8px] font-bold uppercase tracking-[.13em] text-white/38">{label}</div></div>)}</div>
          </motion.div>

          <motion.article style={{ y: modelY, x: modelX, rotateX: reduceMotion ? 0 : modelRotateX, rotateY: reduceMotion ? 0 : modelRotateY, transformPerspective: 1100 }} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .68, delay: .06 }} className="relative min-h-[570px] overflow-hidden rounded-[2rem] border border-white/12 bg-forest-950/68 shadow-[0_32px_90px_rgba(0,0,0,.28)] backdrop-blur-sm will-change-transform">
            <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between p-5 sm:p-6"><div><p className="font-mono text-[9px] uppercase tracking-[.15em] text-leaf-400">Photo grading workflow</p><p className="mt-1 text-[10px] font-bold text-white/48">Results come from the submitted harvest photo</p></div><span className="pill border border-white/12 bg-white/8"><BadgeCheck className="size-3 text-leaf-400" /> Visual grade</span></div>
            <div className="absolute inset-0"><HarvestTwin crop="tomato" /></div>
            <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-forest-950 via-forest-950/95 to-transparent px-5 pb-5 pt-32 sm:px-6 sm:pb-6">
              <div><p className="font-mono text-[8px] uppercase tracking-[.14em] text-white/38">What the analysis returns</p><h2 className="mt-2 text-3xl font-black leading-[.94] tracking-[-.06em] text-[#f4f5b5] sm:text-4xl">Grade distribution.<br /><span className="text-white/52">Shelf-life estimate. Suggested match.</span></h2></div>
              <div className="mt-5 grid grid-cols-3 gap-2">{["Grade mix", "Visible defects", "Expected shelf life"].map((label) => <span key={label} className="rounded-xl border border-white/10 bg-white/6 p-3 text-[8px] font-bold uppercase text-white/55">{label}</span>)}</div>
            </div>
          </motion.article>
        </div>
      </section>

      <div className="overflow-hidden border-y border-forest-950/10 bg-[#e5e9a4] py-4"><motion.div className="flex w-max gap-10 whitespace-nowrap text-[10px] font-extrabold uppercase tracking-[.16em] text-forest-800" animate={{ x: [0, -790] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }}>{Array.from({ length: 3 }).flatMap(() => ["Scan & grade", "List produce", "Protect payment", "Verify delivery", "Pay farmer", "Match shelf life"]).map((item, index) => <span key={`${item}-${index}`} className="inline-flex items-center gap-10">{item}<i className="size-1.5 rounded-full bg-leaf-500" /></span>)}</motion.div></div>

      <div className="site-container py-14 sm:py-16">
        <Reveal className="grid gap-8 border-b border-black/8 pb-10 lg:grid-cols-[.75fr_1.25fr] lg:items-end"><div><span className="eyebrow">How it works</span><h2 className="mt-3 text-4xl font-black leading-[.96] tracking-[-.065em] sm:text-6xl">One crate.<br /><span className="text-ink-600/40">One complete trade.</span></h2></div><p className="max-w-2xl text-sm leading-[1.8] text-ink-600">YieldGrid membantu petani menunjukkan kualitas hasil panen dan memberi pembeli cara yang jelas untuk membeli langsung dengan pembayaran yang terlindungi.</p></Reveal>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{demoBeats.map(({ no, icon: Icon, title, copy }, index) => <Reveal key={no} delay={index * .05}><article className={`min-h-[270px] rounded-[1.5rem] border p-5 ${index === 1 ? "grid-field border-white/8 text-white" : "border-forest-950/9 bg-white"}`}><div className="flex items-center justify-between"><span className={`grid size-11 place-items-center rounded-xl ${index === 1 ? "bg-leaf-400 text-forest-950" : "bg-leaf-100 text-forest-700"}`}><Icon className="size-4" /></span><span className={`font-mono text-[9px] ${index === 1 ? "text-white/38" : "text-ink-600/45"}`}>{no}/04</span></div><h3 className="mt-8 text-xl font-black tracking-[-.04em]">{title}</h3><p className={`mt-3 text-[11px] leading-5 ${index === 1 ? "text-white/50" : "text-ink-600"}`}>{copy}</p></article></Reveal>)}</div>

        <section className="mt-14 grid gap-4 lg:grid-cols-[.78fr_1.22fr]">
          <Reveal className="grid-field relative min-h-[600px] overflow-hidden rounded-[2rem] p-7 text-white sm:p-9"><div className="absolute -right-20 -top-24 size-72 rounded-full border border-leaf-400/20" /><span className="pill bg-white/8 text-leaf-400"><Camera className="size-3" /> Farmer workspace</span><h2 className="mt-8 text-4xl font-black leading-[.95] tracking-[-.06em]">Scan. Grade.<br />List. Get paid.</h2><p className="mt-4 max-w-sm text-xs leading-6 text-white/48">Satu aksi utama per layar, tombol besar, dan kontras tinggi untuk penggunaan satu tangan di luar ruangan.</p><div className="absolute inset-x-5 bottom-5 rounded-[1.4rem] bg-white/92 p-5 text-forest-950"><p className="eyebrow">Real farmer workflow</p><div className="mt-4 space-y-3">{["Submit an actual crate photo", "Review the returned visual assessment", "Set a price and publish the saved listing"].map((label) => <div key={label} className="flex items-center gap-3 rounded-xl bg-cream-50 p-3 text-[9px] font-bold"><BadgeCheck className="size-4 text-forest-700" />{label}</div>)}</div></div></Reveal>

          <Reveal delay={.08} className="panel overflow-hidden p-3 sm:p-4"><div className="rounded-[1.4rem] bg-cream-50 p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-4"><div><span className="pill bg-leaf-100 text-forest-700"><ShoppingBasket className="size-3" /> Buyer dashboard</span><h2 className="mt-5 text-3xl font-black tracking-[-.05em] sm:text-4xl">Quality you can see<br />before buying.</h2></div><span className="pill bg-forest-950 text-white"><HandCoins className="size-3 text-leaf-400" /> Direct price</span></div><div className="mt-8 grid gap-3 sm:grid-cols-2"><div className="tomato-photo min-h-[280px] rounded-2xl p-5 text-white flex items-end"><div><span className="pill bg-leaf-400 text-forest-950">Saved farmer listing</span><h3 className="mt-3 text-2xl font-black">Actual harvest details</h3><p className="mt-2 text-[10px] leading-5 text-white/60">Photo, farmer location, weight, and price come from the selected listing.</p></div></div><div className="rounded-2xl bg-white p-5"><p className="eyebrow">Before purchase</p><div className="mt-6 space-y-3">{["Compare the returned grade distribution", "Review the shelf-life estimate", "Enter a real delivery address", "Confirm the saved order total"].map((label) => <div key={label} className="flex items-center gap-3 rounded-xl bg-cream-50 p-3 text-[9px] font-bold"><BadgeCheck className="size-4 text-forest-700" />{label}</div>)}</div></div></div></div></Reveal>
        </section>

        <Reveal className="mt-14 grid overflow-hidden rounded-[2rem] bg-[#dfe79a] lg:grid-cols-[1fr_1fr]"><div className="p-8 sm:p-11 lg:p-14"><span className="pill bg-forest-950 text-white"><ShieldCheck className="size-3" /> Protected payment</span><h2 className="mt-7 text-4xl font-black leading-[.96] tracking-[-.065em] sm:text-5xl">Trust built into<br /><span className="text-forest-950/42">every direct order.</span></h2><p className="mt-5 max-w-xl text-sm leading-7 text-forest-950/60">Pembeli melihat kapan pembayaran dilindungi, kapan delivery diverifikasi, dan kapan petani menerima pembayaran.</p></div><div className="grid-field p-8 text-white sm:p-11 lg:p-14"><p className="eyebrow !text-leaf-400">Clear at every step</p><div className="mt-8 space-y-4">{[[ShieldCheck, "Payment protection", "Payment stays protected until delivery is verified."], [Truck, "Delivery details", "The saved recipient and address remain visible on the order."], [Factory, "Waste routing", "Short shelf-life produce is matched with suitable buyers."]].map(([Icon, title, copy]) => { const ItemIcon = Icon as typeof ShieldCheck; return <div key={String(title)} className="flex gap-4 border-b border-white/9 pb-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/7 text-leaf-400"><ItemIcon className="size-4" /></span><div><h3 className="text-sm font-black">{String(title)}</h3><p className="mt-1 text-[10px] leading-5 text-white/45">{String(copy)}</p></div></div>; })}</div></div></Reveal>

        <Reveal className="relative mt-14 flex flex-col gap-8 overflow-hidden rounded-[2rem] bg-forest-950 p-8 text-white sm:p-11 lg:flex-row lg:items-end lg:justify-between"><div className="absolute -right-5 -top-16 text-[15rem] font-black text-white/[0.025]">01</div><div className="relative"><span className="eyebrow !text-leaf-400">Start selling</span><h2 className="mt-4 text-[clamp(2.7rem,5.6vw,5.5rem)] font-black leading-[.92] tracking-[-.07em]">From one photo<br /><span className="text-white/38">to one safe payout.</span></h2></div><Link href="/farmer" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-leaf-400 px-5 py-3.5 text-xs font-extrabold text-forest-950">Open farmer workspace <ArrowRight className="size-4" /></Link></Reveal>
      </div>
    </>
  );
}
