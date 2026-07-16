import type { Metadata } from "next";
import { DM_Mono, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: { default: "YieldGrid — Harvest Intelligence", template: "%s — YieldGrid" },
  description: "Frontend intelligence untuk memantau, menyelamatkan, dan menyalurkan hasil panen Indonesia.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${manrope.variable} ${dmMono.variable}`}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
