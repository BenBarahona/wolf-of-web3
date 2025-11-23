// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_BASE_URL =
  process.env.NEXT_PUBLIC_APP_BASE_URL || "https://celo-chain.wolf-of-web3.xyz";

const miniAppEmbed = {
  version: "1",
  imageUrl: `${APP_BASE_URL}/miniapp-preview.png`,
  button: {
    title: "Open Wolf of Web3",
    action: {
      type: "launch_miniapp",
      name: "Wolf of Web3",
      url: APP_BASE_URL,
      splashImageUrl: `${APP_BASE_URL}/miniapp-splash.png`,
      splashBackgroundColor: "#000000",
    },
  },
};

export const metadata: Metadata = {
  title: "Wolf of Web3 - AI-Powered Personal Broker",
  description:
    "Invest smarter with AI-powered DeFi strategies on Circle Smart Wallets",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  other: {
    "fc:miniapp": JSON.stringify(miniAppEmbed),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
