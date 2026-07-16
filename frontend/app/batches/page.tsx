import type { Metadata } from "next";
import { Download, Plus } from "lucide-react";
import { BatchTable } from "@/components/batch-table";
import { PageIntro } from "@/components/page-intro";
import { Reveal } from "@/components/reveal";
import { harvestBatches } from "@/lib/data";

export const metadata: Metadata = { title: "Harvest Batches | YieldGrid" };

export default function BatchesPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Harvest registry · 18 aktif" title="Setiap panen punya identitas." description="Telusuri asal, kualitas, bobot, harga, dan status distribusi dari satu digital harvest passport." action={<div className="flex gap-2"><button className="soft-button"><Download className="size-3.5" /> Export</button><button className="primary-button"><Plus className="size-3.5" /> Batch baru</button></div>} />
      <Reveal className="mt-6"><BatchTable batches={harvestBatches} /></Reveal>
      <p className="mt-4 text-center font-mono text-[8px] uppercase tracking-[.16em] text-ink-600/55">Demo data · diperbarui otomatis setiap 30 detik</p>
    </main>
  );
}
