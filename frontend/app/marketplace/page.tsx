import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerMarketplace } from "@/components/buyer-marketplace";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Buyer Marketplace" };

export default function MarketplacePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Buyer marketplace" title="Buy direct. Know the crate." description="Compare visual quality, expected shelf life, farmer location, and direct prices before buying." />
      <div className="mt-6"><Suspense><BuyerMarketplace /></Suspense></div>
    </main>
  );
}
