import type { Metadata, Viewport } from "next";
import { DemoProvider } from "@/components/demo-provider";
import { SiteHeader } from "@/components/site-header";
import { AuthProvider } from "@/components/auth-provider";
import { SessionBoundary } from "@/components/session-boundary";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:4173"),
  title: { default: "YieldGrid — Direct farm-to-buyer marketplace", template: "%s — YieldGrid" },
  description: "Verified quality, safe direct payment, and shelf-life-aware matching for farm-to-buyer trade.",
  applicationName: "YieldGrid",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "YieldGrid — Direct farm-to-buyer marketplace",
    description: "Verified quality. Safe direct payment.",
    type: "website",
    images: [{ url: "/og.png", width: 1734, height: 907, alt: "YieldGrid verified quality and safe direct payment" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "YieldGrid — Direct farm-to-buyer marketplace",
    description: "Verified quality. Safe direct payment.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0c2419",
  colorScheme: "dark",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>
        <AuthProvider>
          <SessionBoundary>
            <DemoProvider>
              <SiteHeader />
              <main>{children}</main>
            </DemoProvider>
          </SessionBoundary>
        </AuthProvider>
      </body>
    </html>
  );
}
