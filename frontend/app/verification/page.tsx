import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { SettlementReceipt } from "@/components/settlement-receipt";

export const metadata: Metadata = { title: "Payment Receipt" };

export default function VerificationPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Payment receipt" title="A clear record of the completed order." description="Review the buyer, farmer, produce, delivery confirmation, and final payment." />
      <div className="mt-6"><SettlementReceipt /></div>
    </main>
  );
}
