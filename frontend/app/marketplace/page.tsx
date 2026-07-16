import type { Metadata } from "next";
import { Suspense } from "react";
import { BuyerMarketplace } from "@/components/buyer-marketplace";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Buyer Marketplace" };

export default function MarketplacePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surface 02 · Buyer dashboard" title="Buy direct. Know the crate." description="Chef Rosa sees verified visual quality, shelf-life, Codex mapping, farmer reputation, and a fair direct price before committing funds." />
      <div className="mt-6"><Suspense><BuyerMarketplace /></Suspense></div>
    </main>
  );
}
