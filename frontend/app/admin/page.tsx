import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Admin Control" };

export default function AdminPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Administration" title="Monitor and control YieldGrid." description="A role-protected operational view of accounts, commerce, marketplace inventory, integrations, and administrative activity." />
      <div className="mt-8"><AdminDashboard /></div>
    </main>
  );
}
