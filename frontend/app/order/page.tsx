import type { Metadata } from "next";
import { OrderExperience } from "@/components/order-experience";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Active Order" };

export default function OrderPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surface 03 · Order & delivery" title="Direct trade, safely settled." description="Escrow status and proof are real product concepts; truck movement and cold-chain telemetry are persistently labeled as simulated." />
      <div className="mt-6"><OrderExperience /></div>
    </main>
  );
}
