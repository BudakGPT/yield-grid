import type { Metadata } from "next";
import { FarmerPwa } from "@/components/farmer-pwa";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Farmer Workspace" };

export default function FarmerPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Farmer workspace" title="A farmer's harvest, graded fairly." description="Photograph a crate, review its visual grade, list it for buyers, and follow the payment status." />
      <div className="mt-8"><FarmerPwa /></div>
    </main>
  );
}
