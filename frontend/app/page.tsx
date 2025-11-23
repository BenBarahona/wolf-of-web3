// app/page.tsx
"use client";

import WalletSetup from "@/components/WalletSetup";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", background: "#000" }}>
      <WalletSetup />
    </div>
  );
}