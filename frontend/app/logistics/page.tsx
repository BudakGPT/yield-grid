import type { Metadata } from "next";
import { LocateFixed, Plus } from "lucide-react";
import { LogisticsMap } from "@/components/logistics-map";
import { PageIntro } from "@/components/page-intro";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = { title: "Logistics | YieldGrid" };

export default function LogisticsPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Live logistics · 6 armada" title="Dari kebun ke pasar, tanpa titik buta." description="Pantau titik pengumpulan, rute distribusi, kapasitas armada, dan kondisi cold-chain langsung di atas Google Maps." action={<div className="flex gap-2"><button className="soft-button"><LocateFixed className="size-3.5" /> Live center</button><button className="primary-button"><Plus className="size-3.5" /> Dispatch</button></div>} />
      <Reveal className="mt-6"><LogisticsMap /></Reveal>
    </main>
  );
}
