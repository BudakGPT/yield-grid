import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DemoConsole } from "@/components/demo-console";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Demo Console" };

export default function DemoPage() {
  if (process.env.NEXT_PUBLIC_DEMO_ENABLED !== "true") notFound();

  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Demo controls" title="Preview each order state." description="Move an active order through delivery, a temperature issue, payment, or reset it for another walkthrough." />
      <div className="mt-6"><DemoConsole /></div>
    </main>
  );
}
