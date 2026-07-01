import type { Metadata, Viewport } from "next";
import { Inter, Amiri } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const amiri = Amiri({
  weight: ["400", "700"],
  variable: "--font-amiri",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "Repaso - Memorización del Corán",
  description: "Aplicación para repasar el Corán usando el método Osmanlı usulü",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#10b981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${inter.variable} ${amiri.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
