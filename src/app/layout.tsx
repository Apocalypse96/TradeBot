import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VoiceTrader Pro - Voice-Operated Trading Bot",
  description:
    "A modern web-based voice-operated trading bot for Over-the-Counter (OTC) digital asset trades with real-time market data.",
  keywords: ["trading", "voice", "crypto", "OTC", "bot", "real-time"],
  authors: [{ name: "VoiceTrader Pro" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
