import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerMarketplace } from "@/components/buyer-marketplace";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Marketplace" };

export default function MarketplacePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Harvest marketplace" title="Browse direct. Know the crate." description="All account roles can inspect visual quality, expected shelf life, farmer location, and direct prices; purchasing remains buyer-only." />
      <div className="mt-6"><Suspense><BuyerMarketplace /></Suspense></div>
    </main>
  );
}
