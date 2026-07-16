"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Filter, Search, SlidersHorizontal } from "lucide-react";
import type { BatchStatus, HarvestBatch } from "@/lib/data";

const filters: Array<"All" | BatchStatus> = ["All", "Ready", "In transit", "Rescue", "Verified"];

const statusStyle: Record<BatchStatus, string> = {
  Ready: "bg-leaf-100 text-forest-700",
  "In transit": "bg-[#e7eff9] text-[#315e87]",
  Rescue: "bg-clay-100 text-clay-500",
  Verified: "bg-forest-950 text-white",
};

export function BatchTable({ batches }: { batches: HarvestBatch[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const [selected, setSelected] = useState<HarvestBatch | null>(null);

  const visible = useMemo(() => batches.filter((batch) => {
    const matchesFilter = filter === "All" || batch.status === filter;
    const haystack = `${batch.id} ${batch.crop} ${batch.farmer} ${batch.location}`.toLowerCase();
    return matchesFilter && haystack.includes(query.toLowerCase());
  }), [batches, filter, query]);

  return (
    <>
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-forest-950/8 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <label className="flex h-11 w-full items-center gap-3 rounded-xl border border-forest-950/10 bg-cream-50 px-3 md:max-w-sm">
            <Search className="size-4 text-ink-600" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-ink-600/55" placeholder="Cari batch, komoditas, petani..." />
          </label>
          <div className="scrollbar-hide flex gap-1 overflow-x-auto">
            {filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-lg px-3 py-2 text-[9px] font-extrabold transition ${filter === item ? "bg-forest-950 text-white" : "bg-cream-100 text-ink-600 hover:bg-cream-200"}`}>{item}</button>)}
            <button className="grid size-9 shrink-0 place-items-center rounded-lg border border-forest-950/10 bg-white" aria-label="Filter lanjutan"><SlidersHorizontal className="size-3.5" /></button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="bg-cream-50 text-[9px] font-extrabold uppercase tracking-[.13em] text-ink-600">
              <tr><th className="px-5 py-4">Batch</th><th className="px-4 py-4">Asal</th><th className="px-4 py-4">Panen</th><th className="px-4 py-4">Bobot / grade</th><th className="px-4 py-4">Harga</th><th className="px-4 py-4">Status</th><th className="px-4 py-4" /></tr>
            </thead>
            <tbody>
              {visible.map((batch) => (
                <tr key={batch.id} onClick={() => setSelected(batch)} className="group cursor-pointer border-t border-forest-950/7 transition hover:bg-leaf-100/40">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-cream-100 text-base">{batch.crop === "Mangga" ? "🥭" : batch.crop === "Cabai" ? "🌶️" : "🌱"}</span><div><p className="text-xs font-extrabold text-forest-950">{batch.crop}</p><p className="mt-0.5 font-mono text-[9px] text-ink-600">{batch.id}</p></div></div></td>
                  <td className="px-4 py-4"><p className="text-[11px] font-bold">{batch.farmer}</p><p className="mt-1 text-[9px] text-ink-600">{batch.location}</p></td>
                  <td className="px-4 py-4 text-[10px] font-semibold text-ink-600">{batch.harvestDate}</td>
                  <td className="px-4 py-4"><p className="text-[11px] font-extrabold">{batch.weight.toLocaleString("id-ID")} kg</p><p className="mt-1 text-[9px] text-ink-600">Grade {batch.grade}</p></td>
                  <td className="px-4 py-4 text-[11px] font-bold">Rp{batch.price.toLocaleString("id-ID")}/kg</td>
                  <td className="px-4 py-4"><span className={`pill ${statusStyle[batch.status]}`}>{batch.status === "Verified" && <CheckCircle2 className="size-3" />}{batch.status}</span></td>
                  <td className="px-4 py-4"><ChevronRight className="size-4 text-ink-600 transition group-hover:translate-x-1" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && <div className="grid min-h-48 place-items-center text-center"><div><Filter className="mx-auto size-6 text-ink-600/40" /><p className="mt-3 text-xs font-bold text-ink-600">Tidak ada batch yang cocok.</p></div></div>}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[70] grid place-items-end bg-forest-950/45 p-3 backdrop-blur-sm sm:place-items-center" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}>
          <div className="w-full max-w-md rounded-[1.6rem] bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between"><div><p className="eyebrow">Digital harvest passport</p><h2 className="mt-2 text-2xl font-black tracking-tight">{selected.crop} · {selected.id}</h2></div><button onClick={() => setSelected(null)} className="grid size-9 place-items-center rounded-xl bg-cream-100 text-sm">×</button></div>
            <div className="mt-6 grid grid-cols-2 gap-2 text-[10px]">
              {[["Petani", selected.farmer], ["Koperasi", selected.cooperative], ["Bobot", `${selected.weight} kg`], ["Grade", selected.grade], ["Lokasi", selected.location], ["Proof", selected.proof]].map(([label, value]) => <div key={label} className="rounded-xl bg-cream-50 p-3"><p className="text-ink-600">{label}</p><p className="mt-1 font-extrabold text-forest-950">{value}</p></div>)}
            </div>
            <button onClick={() => setSelected(null)} className="primary-button mt-5 w-full">Tutup passport</button>
          </div>
        </div>
      )}
    </>
  );
}
