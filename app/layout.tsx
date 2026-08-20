import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { KnifeFinderAssistant } from "@/components/chat/KnifeFinderAssistant";
import { InsiderPopup } from "@/components/InsiderPopup";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Toros Knife & Tool | Handcrafted Turkish-Inspired Blades",
    template: "%s | Toros Knife & Tool",
  },
  description:
    "Handcrafted knives rooted in Turkish tradition and built for American outdoor adventure. Fixed blades, folders, neck knives, custom commissions, and axes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-toros-black text-toros-parchment">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <InsiderPopup />
        <KnifeFinderAssistant />
      </body>
    </html>
  );
}
