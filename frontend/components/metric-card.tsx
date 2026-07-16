import type { LucideIcon } from "lucide-react";
import { ArrowUpRight } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string;
  change: string;
  note: string;
  icon: LucideIcon;
  dark?: boolean;
};

export function MetricCard({ label, value, change, note, icon: Icon, dark = false }: MetricCardProps) {
  return (
    <article className={`relative min-h-48 overflow-hidden rounded-[1.35rem] border p-5 ${dark ? "grid-field border-white/8 text-white" : "border-forest-950/9 bg-white text-forest-950"}`}>
      <div className="flex items-start justify-between">
        <span className={`grid size-9 place-items-center rounded-xl ${dark ? "bg-white/8 text-leaf-400" : "bg-leaf-100 text-forest-700"}`}><Icon className="size-4" /></span>
        <span className={`pill ${dark ? "bg-leaf-400/14 text-leaf-400" : "bg-leaf-100 text-forest-700"}`}><ArrowUpRight className="size-3" />{change}</span>
      </div>
      <p className={`mt-8 text-[10px] font-extrabold uppercase tracking-[.16em] ${dark ? "text-white/46" : "text-ink-600"}`}>{label}</p>
      <p className="mt-1 text-3xl font-black tracking-[-.05em]">{value}</p>
      <p className={`mt-2 text-[11px] ${dark ? "text-white/45" : "text-ink-600"}`}>{note}</p>
    </article>
  );
}
