import type { Metadata } from "next";
import { DemoConsole } from "@/components/demo-console";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Demo Console" };

export default function DemoPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Surface 04 · Hidden operator console" title="Control the story, not the product." description="Transit simulation, breach injection, force-settle fallback, readiness lights, and one-click reset for repeatable judge waves." />
      <div className="mt-6"><DemoConsole /></div>
    </main>
  );
}
