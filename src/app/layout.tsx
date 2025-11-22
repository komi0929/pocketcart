import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { APP_NAME } from "@/lib/brand";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "pocketcart - Instagramからすぐに販売をはじめる",
  manifest: "/site.webmanifest",
  themeColor: "#ff8a00",
  icons: {
    icon: [
      { url: "/brand/pocketcart-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/pocketcart-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/pocketcart-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
