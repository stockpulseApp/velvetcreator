import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { DemoModeBanner } from "@/components/layout/DemoModeBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MobileNav } from "@/components/layout/MobileNav";
import { getSession } from "@/lib/session";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-family",
});

const sans = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans-family",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "VelvetCreator — Where creators own their audience",
    template: "%s · VelvetCreator",
  },
  description:
    "The fetish-native creator platform: multi-tier subscriptions, live shows, escrow custom requests, physical shop, and a studio built for serious earners.",
  openGraph: {
    title: "VelvetCreator",
    description: "Subscriptions, live, shop & custom requests — one wallet, transparent fees.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VelvetCreator",
    description: "Built for fetish creators who want more than a single paywall.",
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-mesh grain min-h-screen">
        <DemoModeBanner />
        <SiteHeader session={session} />
        <div className={session ? "has-bottom-nav" : ""}>{children}</div>
        <SiteFooter />
        {session && (
          <Suspense fallback={null}>
            <MobileNav role={session.role} />
          </Suspense>
        )}
      </body>
    </html>
  );
}
