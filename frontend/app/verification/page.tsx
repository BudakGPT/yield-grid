import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SettlementReceipt } from "@/components/settlement-receipt";

export const metadata: Metadata = { title: "Settlement Receipt" };

export default function VerificationPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Progressive disclosure · Settlement proof" title="Simple for users. Verifiable for judges." description="The everyday experience says funds secured and farmer paid; testnet and IPFS details stay one layer deeper for anyone who wants to inspect them." />
      <div className="mt-6"><SettlementReceipt /></div>
    </main>
  );
}
