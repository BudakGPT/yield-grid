import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Sign in" };

export default function AuthPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="Account access" title="Enter as farmer or buyer." description="Create an account or sign in to manage harvests, purchases, and payments." />
      <div className="mt-8"><AuthScreen /></div>
    </main>
  );
}
