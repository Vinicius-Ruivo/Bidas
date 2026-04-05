import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { AppProviders } from "@/components/app-providers";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bidas | VetAnest.IA",
  description:
    "Co-piloto de anestesiologia veterinária com calculadora de doses e prontuário perioperatório.",
  manifest: "/manifest.webmanifest",
  themeColor: "#09090b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bidas",
  },
  icons: {
    icon: [{ url: "/icons/icon-192.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
        <PwaRegister />
      </body>
    </html>
  );
}
