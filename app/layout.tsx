import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { HeroHeader } from "@/components/header";
import FooterSection from "@/components/footer";
import Loader from "@/components/loader";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://cursor-ttw-lanyard.vercel.app";

export const metadata: Metadata = {
  title: "Cursor × Toronto Tech Week — Canada's Largest Cursor Event",
  description:
    "400+ builders. Workshops, hackathon, panels & networking. Join Canada's largest Cursor event during Toronto Tech Week, May 27 2026.",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Cursor × Toronto Tech Week — Canada's Largest Cursor Event",
    description:
      "400+ builders. Workshops, hackathon, panels & networking. Design your lanyard and join us.",
    url: SITE_URL,
    siteName: "Cursor × Toronto Tech Week",
    type: "website",
    images: [{ url: `${SITE_URL}/api/og`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cursor × Toronto Tech Week — Canada's Largest Cursor Event",
    description:
      "400+ builders. Workshops, hackathon, panels & networking. Design your lanyard and join us.",
    images: [`${SITE_URL}/api/og`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${geist.variable} ${geistMono.variable} ${jetbrainsMono.variable}`}
    >
      <body className="font-sans antialiased bg-[#131315] text-[#ededf0] flex flex-col min-h-dvh lg:h-dvh">
        <Loader />
        <HeroHeader />
        <main className="flex-1 lg:min-h-0 flex flex-col overflow-x-hidden">{children}</main>
        <FooterSection />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
