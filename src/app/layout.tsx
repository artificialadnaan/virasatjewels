import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "VirasatJewels — Heirloom Craftsmanship",
    template: "%s | VirasatJewels",
  },
  description:
    "Handcrafted heritage jewelry — gold, kundan, meenakari and filigree pieces crafted by master artisans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
