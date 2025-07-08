import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3004'),
  title: "Nunuza - Africa's Digital Marketplace",
  description: "Buy and sell anything across East Africa. Connect with local buyers and sellers in Uganda, Kenya, Tanzania and more.",
  keywords: "marketplace, classifieds, buy, sell, Uganda, Kenya, Tanzania, Africa",
  authors: [{ name: "Nunuza Team" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Nunuza - Africa's Digital Marketplace",
    description: "Connect buyers and sellers across East Africa",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/logo_full.png",
        width: 1200,
        height: 630,
        alt: "Nunuza - Your local digital marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nunuza - Africa's Digital Marketplace",
    description: "Connect buyers and sellers across East Africa",
    images: ["/logo_full.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <ClientWrapper>
          {children}
        </ClientWrapper>
      </body>
    </html>
  );
}
