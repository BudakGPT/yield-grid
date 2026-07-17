import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProfilePanel } from "@/components/profile-panel";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Account · Profile" title="Manage your YieldGrid identity." description="Keep your public-facing details current while Supabase protects your login identity and YieldGrid manages your wallet status." />
      <div className="mt-8"><ProfilePanel /></div>
    </main>
  );
}
