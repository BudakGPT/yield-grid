import type { Metadata } from "next";
import { AuthScreen } from "@/components/auth-screen";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = { title: "Sign in" };

export default function AuthPage() {
  return (
    <main className="site-container py-8 md:py-12">
      <PageIntro eyebrow="User auth" title="Enter as farmer or buyer." description="One web2 account maps to one custodial Stellar identity; no seed phrase or gas is exposed to the user." />
      <div className="mt-8"><AuthScreen /></div>
    </main>
  );
}
