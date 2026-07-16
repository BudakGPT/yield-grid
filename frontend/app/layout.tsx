import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import { DemoProvider } from "@/components/demo-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

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

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} ${dmMono.variable}`}>
        <DemoProvider>
          <SiteHeader />
          <main>{children}</main>
        </DemoProvider>
      </body>
    </html>
  );
}
