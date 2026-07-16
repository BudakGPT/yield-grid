import type { Metadata } from "next";
import { FarmerPwa } from "@/components/farmer-pwa";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Farmer PWA" };

export default function FarmerPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surface 01 · Farmer PWA" title="Amara’s harvest, graded fairly." description="Mobile-first scan, Codex-based visual grade, shelf-life estimate, direct listing, and instant payout feedback—all demonstrated with frontend-only data." />
      <div className="mt-8"><FarmerPwa /></div>
    </main>
  );
}
