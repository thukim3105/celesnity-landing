import type { Metadata, Viewport } from "next";
import {
  Geist,
  Geist_Mono,
  Unna,
  Poppins,
  Dancing_Script,
  Playwrite_GB_S,
} from "next/font/google";
import "./globals.css";
import { Providers, ThemeScript } from "@/providers";
import { SITE } from "@/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unna = Unna({
  variable: "--font-unna",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dancingScript = Dancing_Script({
  variable: "--font-script",
  subsets: ["latin"],
  weight: ["600", "700"],
});

// Playwrite GB S — the cursive school-hand used for the "Celesnity" intro reveal.
// This family ships no subsets, so preloading must be disabled.
const playwrite = Playwrite_GB_S({
  variable: "--font-playwrite",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: SITE.name,
  description: SITE.description,
};

// Next injects the responsive `width=device-width, initial-scale=1` viewport
// automatically, so we only add what it doesn't: a theme-color matching the
// galaxy background (tints mobile browser chrome) and an explicit dark
// color-scheme. We deliberately leave pinch-zoom enabled (no maximum-scale /
// user-scalable=no) to stay WCAG 1.4.4 / 1.4.10 compliant.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#04091e" },
  ],
  colorScheme: "dark light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${unna.variable} ${poppins.variable} ${dancingScript.variable} ${playwrite.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* No-flash theme init — defaults to dark (galaxy theme) */}
        <ThemeScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
