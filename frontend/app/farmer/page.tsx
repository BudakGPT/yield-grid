import type { Metadata } from "next";
import { FarmerPwa } from "@/components/farmer-pwa";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Farmer PWA" };

export default function FarmerPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surface 01 · Farmer PWA" title="A farmer's harvest, graded fairly." description="Mobile-first capture, server grading, a Postgres-backed listing, and live payout feedback from the settlement event." />
      <div className="mt-8"><FarmerPwa /></div>
    </main>
  );
}
