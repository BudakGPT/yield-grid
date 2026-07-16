import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { RescueBoard } from "@/components/rescue-board";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = { title: "Rescue Market | YieldGrid" };

export default function RescuePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surplus exchange · 7 peluang" title="Temukan pasar sebelum waktu habis." description="Matching berbasis lokasi, kebutuhan pembeli, dan sisa umur simpan untuk mengubah surplus menjadi pendapatan." />
      <Reveal className="mt-6"><RescueBoard /></Reveal>
    </main>
  );
}
