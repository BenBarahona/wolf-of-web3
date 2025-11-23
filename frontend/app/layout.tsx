import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CircleProvider } from "@/lib/circle";
import { Web3Provider } from "@/lib/contracts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wolf of Web3 - AI-Powered Personal Broker",
  description:
    "Invest smarter with AI-powered DeFi strategies on Circle Smart Wallets",
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
        <Web3Provider>
          <CircleProvider>{children}</CircleProvider>
        </Web3Provider>
      </body>
    </html>
  );
}
