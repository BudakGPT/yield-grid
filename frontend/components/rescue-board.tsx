"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUpRight, Clock3, HeartHandshake, MapPin, ShoppingBasket, Sparkles } from "lucide-react";
import { rescueLots } from "@/lib/data";

export function RescueBoard() {
  const [reserved, setReserved] = useState<string[]>([]);

  const reserve = (id: string) => setReserved((current) => current.includes(id) ? current : [...current, id]);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
        <div className="grid-field relative min-h-[360px] overflow-hidden rounded-[1.6rem] p-6 text-white md:p-8">
          <div className="absolute -right-20 -top-28 size-80 rounded-full border border-leaf-400/20" />
          <div className="absolute -right-5 -top-10 size-52 rounded-full border border-dashed border-white/15" />
          <span className="pill bg-leaf-400 text-forest-950"><Sparkles className="size-3" /> Matching AI aktif</span>
          <h2 className="mt-16 max-w-xl text-[clamp(2.5rem,5vw,5.5rem)] font-black leading-[.86] tracking-[-.065em]">Surplus bukan<br /><span className="text-leaf-400">sampah.</span></h2>
          <p className="mt-5 max-w-lg text-sm leading-6 text-white/55">YieldGrid menghubungkan hasil panen yang waktunya sempit ke pembeli terdekat sebelum kualitasnya turun.</p>
          <div className="mt-8 flex flex-wrap gap-5"><div><strong className="text-2xl font-black">1.14 ton</strong><p className="mt-1 text-[9px] uppercase tracking-widest text-white/40">siap diselamatkan</p></div><div className="border-l border-white/15 pl-5"><strong className="text-2xl font-black">Rp18.7jt</strong><p className="mt-1 text-[9px] uppercase tracking-widest text-white/40">nilai dipulihkan</p></div></div>
        </div>
        <div className="tomato-photo flex min-h-[360px] flex-col justify-end overflow-hidden rounded-[1.6rem] p-6 text-white md:p-8">
          <span className="grid size-11 place-items-center rounded-2xl bg-leaf-400 text-forest-950"><HeartHandshake className="size-5" /></span>
          <p className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-leaf-400">Rescue signal 09</p>
          <h3 className="mt-2 text-2xl font-black tracking-tight">Permintaan Jakarta naik 26%</h3>
          <p className="mt-2 text-[11px] leading-5 text-white/55">Saat terbaik mengalihkan surplus tomat dari koridor Bandung.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {rescueLots.map((lot) => {
          const done = reserved.includes(lot.id);
          return (
            <article key={lot.id} className="panel group overflow-hidden p-2">
              <div className="relative h-56 overflow-hidden rounded-[1.1rem]">
                <Image src={lot.image} alt={lot.crop} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/75 via-transparent to-transparent" />
                <span className="pill absolute left-3 top-3 bg-clay-500 text-white">-{lot.discount}</span>
                <span className="absolute bottom-3 left-3 font-mono text-[9px] text-white/65">{lot.id} · {lot.reason}</span>
              </div>
              <div className="p-3 pb-4">
                <div className="flex items-start justify-between gap-3"><div><h3 className="text-xl font-black tracking-tight text-forest-950">{lot.crop}</h3><p className="mt-1 flex items-center gap-1 text-[9px] text-ink-600"><MapPin className="size-3" />{lot.seller} · {lot.location}</p></div><span className="text-right"><strong className="block text-xs text-forest-950">{lot.weight}</strong><small className="text-[8px] uppercase text-ink-600">tersedia</small></span></div>
                <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-cream-200"><div className="h-full rounded-full bg-leaf-500" style={{ width: `${lot.demand}%` }} /></div>
                <div className="mt-2 flex justify-between text-[8px] font-bold uppercase tracking-wider text-ink-600"><span>Minat pembeli {lot.demand}%</span><span className="flex items-center gap-1 text-clay-500"><Clock3 className="size-2.5" />{lot.time}</span></div>
                <div className="mt-5 flex items-center justify-between gap-3"><div><p className="text-lg font-black text-forest-950">{lot.price}</p><p className="text-[8px] uppercase tracking-wider text-ink-600">harga rescue</p></div><button onClick={() => reserve(lot.id)} disabled={done} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-[9px] font-extrabold transition ${done ? "bg-leaf-100 text-forest-700" : "bg-forest-950 text-white hover:-translate-y-0.5"}`}>{done ? "Tersimpan" : "Ambil lot"}{done ? <ShoppingBasket className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}</button></div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
