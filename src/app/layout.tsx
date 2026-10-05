import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

import { CursorProvider } from "@/components/ui/sticky-cursor";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

import localFont from "next/font/local";
import { IBM_Plex_Mono } from "next/font/google";

const neueMontreal = localFont({
  src: [
    { path: "./PPNeueMontreal-Regular.woff2", weight: "400", style: "normal" },
  ],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Vibe Fixer | tonik",
  description: "Vibe Fixer by tonik",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#212121" />
      </head>
      <GoogleTagManager gtmId="GTM-MLWVFD6B" />
      <body
        className={`font-sans antialiased @container ${neueMontreal.variable} ${ibmPlexMono.variable}`}
      >
        <CursorProvider>{children}</CursorProvider>
        <Analytics />
      </body>
    </html>
  );
}
