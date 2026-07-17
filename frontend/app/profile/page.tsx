import type { Metadata } from "next";
import { PageIntro } from "@/components/page-intro";
import { ProfilePanel } from "@/components/profile-panel";

export const metadata: Metadata = { title: "Profile" };

export default function ProfilePage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Account profile" title="Manage your YieldGrid profile." description="Keep your name, contact details, location, and introduction up to date." />
      <div className="mt-8"><ProfilePanel /></div>
    </main>
  );
}
