import type { Metadata } from "next";
import { OrderExperience } from "@/components/order-experience";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Active Order" };

export default function OrderPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Order and delivery" title="Follow every step of your order." description="See payment, delivery, temperature, and farmer payout status in one place." />
      <div className="mt-6"><OrderExperience /></div>
    </main>
  );
}
