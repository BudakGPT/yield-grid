"use client";

import { useState } from "react";
import { ArrowRight, Boxes, Clock3, MapPin, Navigation, Route, ThermometerSnowflake, Truck } from "lucide-react";
import { locations } from "@/lib/data";

export function LogisticsMap() {
  const [activeId, setActiveId] = useState(locations[0].id);
  const active = locations.find((location) => location.id === activeId) ?? locations[0];
  const mapUrl = `https://www.google.com/maps?q=${active.lat},${active.lng}&z=12&output=embed`;

  return (
    <div className="grid gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="panel overflow-hidden p-3">
        <div className="grid-field rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-white/8"><Route className="size-4 text-leaf-400" /></span><span className="pill bg-leaf-400/15 text-leaf-400">4 titik aktif</span></div>
          <h2 className="mt-8 text-xl font-black tracking-tight">Live route corridor</h2>
          <p className="mt-2 text-[11px] leading-5 text-white/50">Pilih titik untuk memantau muatan, cold-chain, dan estimasi tiba.</p>
        </div>
        <div className="mt-2 space-y-1">
          {locations.map((location, index) => (
            <button key={location.id} onClick={() => setActiveId(location.id)} className={`group flex w-full items-center gap-3 rounded-xl p-3 text-left transition ${activeId === location.id ? "bg-leaf-100" : "hover:bg-cream-50"}`}>
              <span className={`grid size-8 shrink-0 place-items-center rounded-full text-[9px] font-black ${activeId === location.id ? "bg-forest-950 text-white" : "border border-forest-950/10 bg-white text-ink-600"}`}>{String(index + 1).padStart(2, "0")}</span>
              <span className="min-w-0 flex-1"><strong className="block truncate text-[11px] text-forest-950">{location.name}</strong><small className="mt-1 block truncate text-[9px] text-ink-600">{location.area}</small></span>
              <ArrowRight className={`size-3.5 transition ${activeId === location.id ? "text-forest-950" : "text-ink-600/30 group-hover:translate-x-1"}`} />
            </button>
          ))}
        </div>
      </aside>

      <section className="panel relative min-h-[650px] overflow-hidden bg-forest-950 p-2">
        <div className="map-frame h-[650px] overflow-hidden rounded-[1.1rem] bg-cream-100">
          <iframe key={active.id} src={mapUrl} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={`Peta ${active.name}`} />
        </div>
        <div className="pointer-events-none absolute inset-x-5 top-5 flex items-start justify-between gap-3">
          <div className="pointer-events-auto max-w-[280px] rounded-2xl border border-white/50 bg-white/92 p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-forest-950 text-leaf-400"><MapPin className="size-4" /></span><div><p className="eyebrow">Titik terpilih</p><h3 className="mt-1 text-sm font-black text-forest-950">{active.name}</h3><p className="mt-1 text-[9px] text-ink-600">{active.area}</p></div></div>
          </div>
          <button className="pointer-events-auto hidden size-11 place-items-center rounded-xl bg-forest-950 text-leaf-400 shadow-xl sm:grid" aria-label="Pusatkan peta"><Navigation className="size-4" /></button>
        </div>
        <div className="absolute inset-x-5 bottom-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            [Boxes, "Batch", String(active.batches)],
            [Truck, "Kapasitas", `${active.capacity}%`],
            [Clock3, "ETA", active.eta],
            [ThermometerSnowflake, "Suhu", active.temperature],
          ].map(([Icon, label, value]) => {
            const ItemIcon = Icon as typeof Boxes;
            return <div key={String(label)} className="rounded-xl border border-white/40 bg-white/92 p-3 shadow-lg backdrop-blur-xl"><ItemIcon className="size-3.5 text-forest-700" /><p className="mt-3 text-[8px] font-bold uppercase tracking-wider text-ink-600">{String(label)}</p><p className="mt-1 text-xs font-black text-forest-950">{String(value)}</p></div>;
          })}
        </div>
      </section>
    </div>
  );
}
